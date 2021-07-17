import { CharacterId, CharacterUtils, getSpellCategory, Position, SpellAction, SpellId, StaticCharacter, switchUtil } from '@timeflies/common';
import { BattleNotifyMessage, Message } from '@timeflies/socket-messages';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';
import { AIScenarioProps } from './ai-scenario';
import { createAIScenarioUtils } from './ai-scenario-utils';
import { offensiveToEnemyAIScenario } from './ai-scenarios/offensive-to-enemy-ai-scenario';
import { offensiveToEnemyLowLifeAIScenario } from './ai-scenarios/offensive-to-enemy-low-life-ai-scenario';
import { placementToAllyLowLifeAIScenario } from './ai-scenarios/placement-to-ally-low-life-ai-scenario';
import { placementToEnemyAIScenario } from './ai-scenarios/placement-to-enemy-ai-scenario';
import { supportAllyOnceAIScenario } from './ai-scenarios/support-ally-once-ai-scenario';


/**
 * Use of scenarios: 
 * If one fail, try next one
 * Scenario fails if conditions not respected, cannot be done, or launcher die.
 * 
 * 2- [offensive] if enemy low life (<30%) targetable
 *  execute
 * 3- [support] if ally targetable & no support spell used before
 *  execute
 * 4- [placement] if ally low life (<30%) somewhere
 *  move to closest tile [target=ally] (max distance 3)
 * 5- [offensive] if enemy targetable
 *  execute
 * 6- [placement] if enemy somewhere
 *  move to closest tile [target=enemy] (max distance 3)
 * 
 */
const AIScenarioList = [

    offensiveToEnemyLowLifeAIScenario,
    supportAllyOnceAIScenario,
    placementToAllyLowLifeAIScenario,
    offensiveToEnemyAIScenario,
    placementToEnemyAIScenario

];

export class AIBattleService extends BattleAbstractService {
    afterSocketConnect = () => { };

    executeTurn = async (battle: Battle, currentCharacterId: CharacterId) => {

        const character = battle.staticState.characters[ currentCharacterId ];
        const player = battle.staticState.players[ character.playerId ];

        const spells = battle.staticSpells.filter(s => s.characterId === currentCharacterId);

        const messageList: Message[] = [];

        let stateEndTime = battle.currentTurnInfos!.startTime;

        const scenariosUsesMap = AIScenarioList.map(() => 0);

        const getScenarioProps = (nbrScenarioUses: number): AIScenarioProps => {

            const initialState = this.getInitialState(battle);
            const currentState = this.getCurrentState(battle);

            const getCharacterList = (relation: 'enemy' | 'ally') => {
                const { staticCharacters, staticState } = battle;

                const filterFn = switchUtil(relation, {
                    enemy: ({ playerId }: StaticCharacter) => staticState.players[ playerId ].teamColor !== player.teamColor,
                    ally: ({ playerId }: StaticCharacter) => staticState.players[ playerId ].teamColor === player.teamColor
                        && playerId !== player.playerId
                });

                return staticCharacters.filter(c => filterFn(c)
                    && CharacterUtils.isAlive(currentState.characters.health[ c.characterId ]));
            };

            const applySpellAction = async (spellId: SpellId, targetPos: Position, multiplyDuration = 1) => {
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

            const utils = createAIScenarioUtils({
                battle,
                initialState,
                currentState,
                currentCharacterId
            });

            return {
                battle,
                currentCharacter: battle.staticState.characters[ currentCharacterId ],
                staticSpells: {
                    offensive: spells.filter(s => getSpellCategory(s.spellRole) === 'offensive'),
                    support: spells.filter(s => getSpellCategory(s.spellRole) === 'support'),
                    placement: spells.filter(s => getSpellCategory(s.spellRole) === 'placement'),
                },
                initialState,
                currentState,
                stateEndTime,
                enemyList: getCharacterList('enemy'),
                allyList: getCharacterList('ally'),

                nbrScenarioUses,
                utils,

                applySpellAction
            };
        };

        const runEveryScenarios = async () => {
            for (let i = 0; i < AIScenarioList.length; i++) {
                const scenario = AIScenarioList[ i ];

                const scenarioProps = getScenarioProps(scenariosUsesMap[ i ]);

                const success = await scenario(scenarioProps);
                scenariosUsesMap[ i ]++;

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
