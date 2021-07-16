import { CharacterId, CharacterUtils, getSpellCategory, Position, SpellAction, SpellId, StaticCharacter } from '@timeflies/common';
import { BattleNotifyMessage, Message } from '@timeflies/socket-messages';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { Tile } from '@timeflies/tilemap-utils';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export class AIBattleService extends BattleAbstractService {
    afterSocketConnect = () => { };

    /**
     * Use of scenarios: 
     * If one fail, try next one
     * Scenario fails if conditions not respected, cannot be done, or launcher die.
     * 
     * 1- [support] if ally low life (<30%) targetable
     *  execute if +life effects
     * 2- [offensive] if enemy low life (<30%) targetable
     *  execute if -life effects
     * 3- [support] if ally targetable & no support spell used before
     *  execute if effects
     * 4- [support] if ally low life somewhere
     *  move to closest tile where support can be done
     *  execute if effects
     * 5- [offensive] if enemy targetable
     *  execute if effects
     * 6- [placement] *
     *  move to closest tile where offensive can be done
     * 
     */
    executeTurn = async (battle: Battle, currentCharacterId: CharacterId) => {

        const character = battle.staticState.characters[ currentCharacterId ];
        const player = battle.staticState.players[ character.playerId ];

        const spells = battle.staticSpells.filter(s => s.characterId === currentCharacterId);
        const offensiveSpells = spells.filter(s => getSpellCategory(s.spellRole) === 'offensive');
        const placementSpells = spells.filter(s => getSpellCategory(s.spellRole) === 'placement');

        const getEnemies = () => {
            const { staticCharacters, staticState } = battle;
            const currentState = this.getCurrentState(battle);

            return staticCharacters.filter(c => staticState.players[ c.playerId ].teamColor !== player.teamColor
                && CharacterUtils.isAlive(currentState.characters.health[ c.characterId ]));
        };

        const getTargetableList = (characterList: StaticCharacter[], spellId: SpellId) => {
            const { spellRole } = battle.staticState.spells[ spellId ];
            const currentState = this.getCurrentState(battle);

            const rangeArea = getSpellRangeArea(spellRole, {
                characterList: battle.staticCharacters.map(c => c.characterId),
                charactersPositions: currentState.characters.position,
                lineOfSight: currentState.spells.lineOfSight[ spellId ],
                playingCharacterId: currentCharacterId,
                rangeArea: currentState.spells.rangeArea[ spellId ],
                tiledMap: battle.tiledMap
            });

            return characterList.filter(({ characterId }) => {
                const characterPosition = currentState.characters.position[ characterId ];
                return rangeArea.some(p => p.id === characterPosition.id);
            });
        };

        const getCharacterWithLowestHealth = (characterList: StaticCharacter[]) => {
            const currentState = this.getCurrentState(battle);

            return characterList.sort((a, b) => currentState.characters.health[ a.characterId ] < currentState.characters.health[ b.characterId ] ? -1 : 1)[ 0 ];
        };

        const getDistanceBetween = (from: Position, to: Position) => Math.abs(to.x - from.x) + Math.abs(to.y - from.y);

        const getClosestFromList = (characterList: StaticCharacter[]): StaticCharacter | null => {
            const currentState = this.getCurrentState(battle);

            const pos = currentState.characters.position[ currentCharacterId ];

            return characterList.sort((a, b) => {
                const aPos = currentState.characters.position[ a.characterId ];
                const aDistance = getDistanceBetween(pos, aPos);

                const bPos = currentState.characters.position[ b.characterId ];
                const bDistance = getDistanceBetween(pos, bPos);

                return aDistance < bDistance ? -1 : 1;
            })[ 0 ] ?? null;
        };

        const getClosestRangeTilesToTarget = (spellId: SpellId, target: StaticCharacter, { maxDistance = Infinity, ignoreDistanceNull }: {
            maxDistance?: number;
            ignoreDistanceNull?: boolean;
        } = {}) => {
            const { spellRole } = battle.staticState.spells[ spellId ];
            const currentState = this.getCurrentState(battle);

            const currentCharacterPos = currentState.characters.position[ currentCharacterId ];
            const targetPos = currentState.characters.position[ target.characterId ];

            const rangeArea = getSpellRangeArea(spellRole, {
                characterList: battle.staticCharacters.map(c => c.characterId),
                charactersPositions: currentState.characters.position,
                lineOfSight: currentState.spells.lineOfSight[ spellId ],
                playingCharacterId: currentCharacterId,
                rangeArea: currentState.spells.rangeArea[ spellId ],
                tiledMap: battle.tiledMap
            })
                .map(pos => ({
                    pos,
                    distance: getDistanceBetween(pos, targetPos),
                    distanceFromLauncher: getDistanceBetween(pos, currentCharacterPos)
                }))
                .filter(({ pos, distanceFromLauncher }) => Tile.getTileTypeFromPosition(pos, battle.tiledMap) === 'default'
                    && distanceFromLauncher <= maxDistance && (!ignoreDistanceNull || distanceFromLauncher > 0)
                )
                .sort((a, b) => {
                    return a.distance < b.distance ? -1 : 1;
                });

            return rangeArea;
        };

        const messageList: Message[] = [];

        const applySpellAction = async (spellId: SpellId, targetPos: Position, multiplyDuration = 1) => {
            const currentState = this.getCurrentState(battle);

            const spellAction: SpellAction = {
                checksum: '',
                spellId,
                duration: currentState.spells.duration[ spellId ] * multiplyDuration,
                launchTime: stateEndTime,
                targetPos
            };

            const success = await new Promise<boolean>(resolve => {
                void this.services.spellActionBattleService.onSpellAction(battle, {
                    playerId: player.playerId,
                    spellAction,
                    checkChecksum: false,
                    afterSpellActionCheck: checkResult => {
                        if (checkResult.success) {
                            messageList.push(
                                BattleNotifyMessage({
                                    spellAction,
                                    spellEffect: checkResult.spellEffect
                                })
                            );
                        }

                        resolve(checkResult.success);
                    }
                });
            });

            if (success) {
                stateEndTime = spellAction.launchTime + spellAction.duration;
            }

            return success;
        };

        let stateEndTime = battle.currentTurnInfos!.startTime;

        const scenario5 = async () => {
            for (const { spellId } of offensiveSpells) {

                const targetList = getTargetableList(getEnemies(), spellId);
                if (targetList.length) {

                    const target = getCharacterWithLowestHealth(targetList);
                    const targetPos = this.getCurrentState(battle).characters.position[ target.characterId ];

                    const success = await applySpellAction(spellId, targetPos);

                    if (success) {
                        return true;
                    }
                }
            }

            return false;
        };

        const scenario6 = async () => {
            for (const { spellId } of placementSpells) {

                const { spellRole } = battle.staticState.spells[ spellId ];

                const closestEnemy = getClosestFromList(getEnemies());
                if (!closestEnemy) {
                    return false;
                }

                if (spellRole === 'move') {
                    const currentState = this.getCurrentState(battle);

                    const turnEndTime = battle.currentTurnInfos!.startTime + currentState.characters.actionTime[ currentCharacterId ];
                    const remainingTime = turnEndTime - stateEndTime;

                    const maxDistance = Math.min(
                        Math.floor(remainingTime / currentState.spells.duration[ spellId ]),
                        3
                    );

                    const potentialTargets = getClosestRangeTilesToTarget(spellId, closestEnemy, {
                        maxDistance,
                        ignoreDistanceNull: true
                    });

                    for (const { pos: targetPos, distanceFromLauncher } of potentialTargets) {
                        const success = await applySpellAction(spellId, targetPos, distanceFromLauncher);

                        if (success) {
                            return true;
                        }
                    }
                } else {

                    const potentialTargets = getClosestRangeTilesToTarget(spellId, closestEnemy, {
                        ignoreDistanceNull: true
                    });

                    for (const { pos: targetPos } of potentialTargets) {
                        const success = await applySpellAction(spellId, targetPos);

                        if (success) {
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        const scenarioList = [
            scenario5,
            scenario6
        ];

        const runEveryScenarios = async () => {
            for (const scenario of scenarioList) {
                const success = await scenario();
                if (success) {
                    await runEveryScenarios();
                    return;
                }
            }
        };

        await runEveryScenarios();

        if (!messageList.length) {
            return;
        }

        battle.staticPlayers
            .filter(p => p.playerId !== player.playerId)
            .map(player => this.playerSocketMap[ player.playerId ])
            .forEach(playerSocketCell => {
                if (playerSocketCell) {
                    playerSocketCell.send(...messageList);
                }
            });
    };
};
