import { CharacterUtils, ObjectTyped, PlayerId, SerializableState, SpellAction, waitMs } from '@timeflies/common';
import { BattleNotifyMessage, BattleSpellActionMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { CheckSpellParams, spellActionCheck } from '@timeflies/spell-checker';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export class SpellActionBattleService extends BattleAbstractService {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleSpellActionMessageListener(socketCell, currentPlayerId);
    };

    simulateSpellAction = async (
        battle: Battle,
        { playerId, spellAction, checkChecksum }: {
            playerId: PlayerId;
            spellAction: SpellAction;
            checkChecksum: boolean;
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

        return await spellActionCheck({
            spellAction,
            context,
            doChecksum: checkChecksum
        });
    };

    addNewState = async (battle: Battle, state: SerializableState, stateEndTime: number, afterAddingStateToBattle?: () => void) => {
        const { stateStack, staticState } = battle;

        stateStack.push(state);

        if (afterAddingStateToBattle) {
            afterAddingStateToBattle();
        }

        // wait current spell action to end
        const timeBeforeEnd = stateEndTime - Date.now();
        await waitMs(timeBeforeEnd);

        this.services.cycleBattleService.onNewState(battle, state);

        const winnerTeamColor = this.services.endBattleService.isBattleEnded(state, staticState);
        if (winnerTeamColor) {
            await this.services.endBattleService.onBattleEnd(battle, winnerTeamColor, stateEndTime);
        }
    };

    addNewStateWithSpellAction = async (battle: Battle, state: SerializableState, spellAction: SpellAction, afterAddingStateToBattle?: () => void) => {
        const stateEndTime = spellAction.launchTime + spellAction.duration;

        await this.addNewState(battle, state, stateEndTime, afterAddingStateToBattle);
    };

    private addBattleSpellActionMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleSpellActionMessage>(BattleSpellActionMessage, async ({ payload, requestId }, send) => {
        const battle = this.getBattleByPlayerId(currentPlayerId);

        const { spellAction } = payload;

        const lastState = this.getCurrentState(battle);

        const checkResult = await this.simulateSpellAction(battle, {
            playerId: currentPlayerId,
            spellAction,
            checkChecksum: true,
        });

        if (!checkResult.success) {
            send(BattleSpellActionMessage.createResponse(requestId, {
                success: false,
                lastState
            }));
            return;
        }

        await this.addNewStateWithSpellAction(battle, checkResult.newState, spellAction, () => {
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
        });
    });
}
