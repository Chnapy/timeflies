import { CharacterUtils, ObjectTyped, PlayerId, SpellAction } from '@timeflies/common';
import { BattleNotifyMessage, BattleSpellActionMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { CheckSpellActionResult, CheckSpellParams, spellActionCheck } from '@timeflies/spell-checker';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export class SpellActionBattleService extends BattleAbstractService {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleSpellActionMessageListener(socketCell, currentPlayerId);
    };

    onSpellAction = async (
        battle: Battle,
        { playerId, spellAction, checkChecksum, afterSpellActionCheck = () => { } }: {
            playerId: PlayerId;
            spellAction: SpellAction;
            checkChecksum: boolean;
            afterSpellActionCheck?: (checkResult: CheckSpellActionResult) => void;
        }) => {
        const { tiledMap, staticState, currentTurnInfos } = battle;

        const lastState = this.getCurrentState(battle);
        const turnInfos = currentTurnInfos!;

        const staticSpell = staticState.spells[ spellAction.spellId ];

        const spellRangeArea = lastState.spells.rangeArea[ staticSpell.spellId ];
        const spellLineOfSight = lastState.spells.lineOfSight[ staticSpell.spellId ];
        const characterAliveList = ObjectTyped.entries(lastState.characters.health)
            .filter(([ characterId, health ]) => CharacterUtils.isAlive(health))
            .map(([ characterId ]) => characterId);
        const charactersPositions = lastState.characters.position;

        const context: CheckSpellParams[ 'context' ] = {
            clientContext: {
                playerId
            },
            currentTurn: {
                playerId: staticState.characters[ turnInfos.characterId ].playerId,
                characterId: turnInfos.characterId,
                startTime: turnInfos.startTime
            },
            map: {
                tiledMap,
                rangeArea: getSpellRangeArea(staticSpell.spellRole, {
                    tiledMap,
                    rangeArea: spellRangeArea,
                    lineOfSight: spellLineOfSight,
                    characterList: characterAliveList,
                    charactersPositions,
                    playingCharacterId: turnInfos.characterId
                })
            },
            state: lastState,
            staticState
        };

        const checkResult = await spellActionCheck({
            spellAction,
            context,
            doChecksum: checkChecksum
        });

        if (!checkResult.success) {
            afterSpellActionCheck(checkResult);
            return false;
        }

        this.addNewStateToBattle(battle, checkResult.newState);
        
        afterSpellActionCheck(checkResult);

        const stateEndTime = spellAction.launchTime + spellAction.duration;

        await this.addNewStateToCycleAndCheckBattleEnd(battle, checkResult.newState, stateEndTime);

        return true;
    };

    private addBattleSpellActionMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleSpellActionMessage>(BattleSpellActionMessage, async ({ payload, requestId }, send) => {
        const battle = this.getBattleByPlayerId(currentPlayerId);

        const { spellAction } = payload;

        const lastState = this.getCurrentState(battle);

        await this.onSpellAction(battle, {
            playerId: currentPlayerId,
            spellAction,
            checkChecksum: true,
            afterSpellActionCheck: checkResult => {

                if (checkResult.success) {
                    send(BattleSpellActionMessage.createResponse(requestId, { success: true }));

                    battle.staticPlayers
                        .filter(player => player.playerId !== currentPlayerId)
                        .map(player => this.playerSocketMap[ player.playerId ])
                        .forEach(playerSocketCell => {
                            if (playerSocketCell) {
                                playerSocketCell.send(BattleNotifyMessage({
                                    spellAction,
                                    spellEffect: checkResult.spellEffect
                                }));
                            }
                        });
                } else {

                    send(BattleSpellActionMessage.createResponse(requestId, {
                        success: false,
                        lastState
                    }));
                }
            }
        });
    });
}
