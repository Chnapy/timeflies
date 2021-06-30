import { CharacterId, PlayerId } from '@timeflies/common';
import { BattleLeaveMessage, BattleLoadMessage, BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import { Service } from '../../service';
import { BattleId } from '../battle';

export class PlayerBattleService extends Service {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleLoadMessageListener(socketCell, currentPlayerId);
        this.addBattleLeaveMessageListener(socketCell, currentPlayerId);

        socketCell.addDisconnectListener(this.getPlayerDisconnectFn(currentPlayerId));
    };

    checkLeavedAndDisconnectedPlayers = async (battleId: BattleId) => {
        const battle = this.getBattleById(battleId);

        const playersToRemove = Object.entries(battle.disconnectedPlayers)
            .filter(([ playerId, disconnectedTime ]) => disconnectedTime && Date.now() - disconnectedTime > 30_000)
            .map<PlayerId>(([ playerId ]) => playerId);
        playersToRemove.push(...battle.leavedPlayers.values());

        if (!playersToRemove.length) {
            return;
        }

        battle.leavedPlayers.clear();
        playersToRemove.forEach(playerId => {
            delete battle.disconnectedPlayers[ playerId ];
            delete this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ playerId ];
        });

        // add new state
        const newState = produceStateDisconnectedPlayers(
            battle.getCurrentState(),
            Date.now(),
            playersToRemove,
            battle.staticCharacters.reduce<{ [ characterId in CharacterId ]: PlayerId }>((acc, { characterId, playerId }) => {
                acc[ characterId ] = playerId;
                return acc;
            }, {})
        );

        await battle.addNewState(newState, Date.now());

        // send removed players
        this.sendToEveryPlayersExcept(
            BattlePlayerDisconnectRemoveMessage({
                playersToRemove,
                time: newState.time
            }),
            battle.staticPlayers
        );
    };

    private addBattleLoadMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleLoadMessage>(BattleLoadMessage, async ({ payload, requestId }, send) => {
        const battle = this.getBattleById(payload.battleId);

        battle.playerJoin(currentPlayerId);

        const { roomId, staticPlayers, staticCharacters, staticSpells, getCurrentState, getMapInfos, getCycleInfos } = battle;

        send(BattleLoadMessage.createResponse(requestId, {
            roomId,
            tiledMapInfos: getMapInfos('toFrontend'),
            staticPlayers,
            staticCharacters,
            staticSpells,
            initialSerializableState: getCurrentState(),
            cycleInfos: getCycleInfos()
        }));

        this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ] = battle;

        if (battle.canStartBattle()) {
            await battle.startBattle();
        }
    });

    private addBattleLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener(BattleLeaveMessage, async (message, send) => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        if (!battle) {
            return;
        }

        delete this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];

        battle.playerLeave(currentPlayerId);
    });

    private getPlayerDisconnectFn = (currentPlayerId: PlayerId) => () => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        if (!battle) {
            return;
        }

        battle.playerDisconnect(currentPlayerId);

        this.sendToEveryPlayersExcept(
            BattlePlayerDisconnectMessage({ playerId: currentPlayerId }),
            battle.staticPlayers,
            currentPlayerId
        );
    };
}
