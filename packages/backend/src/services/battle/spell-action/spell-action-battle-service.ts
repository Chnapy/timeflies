import { CharacterUtils, ObjectTyped, PlayerId } from '@timeflies/common';
import { BattleNotifyMessage, BattleSpellActionMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { CheckSpellParams, spellActionCheck } from '@timeflies/spell-checker';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { BattleAbstractService } from '../battle-abstract-service';

export class SpellActionBattleService extends BattleAbstractService {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleSpellActionMessageListener(socketCell, currentPlayerId);
    };

    private addBattleSpellActionMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleSpellActionMessage>(BattleSpellActionMessage, async ({ payload, requestId }, send) => {
        const battle = this.getBattleByPlayerId(currentPlayerId);

        const { tiledMap, staticState, currentTurnInfos } = battle;
        const { spellAction } = payload;

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
                playerId: currentPlayerId
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
            context
        });

        if (!checkResult.success) {
            return send(BattleSpellActionMessage.createResponse(requestId, {
                success: false,
                lastState
            }));
        }

        const stateEndTime = spellAction.launchTime + spellAction.duration;

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

        send(BattleSpellActionMessage.createResponse(requestId, { success: true }));

        return this.addNewState(battle, checkResult.newState, stateEndTime);
    });
}
