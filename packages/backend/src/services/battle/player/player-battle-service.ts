import { CharacterId, PlayerId } from '@timeflies/common';
import { BattleLoadMessage, BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import { Service } from '../../service';
import { BattleId } from '../battle';

export class PlayerBattleService extends Service {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleLoadMessageListener(socketCell, currentPlayerId);

        socketCell.addDisconnectListener(this.getPlayerDisconnectFn(currentPlayerId));
    };

    checkDisconnectedPlayers = async (battleId: BattleId) => {
        const battle = this.getBattleById(battleId);

        const playersToRemove = Object.entries(battle.disconnectedPlayers)
            .filter(([ playerId, disconnectedTime ]) => disconnectedTime && Date.now() - disconnectedTime > 30_000)
            .map<PlayerId>(([ playerId ]) => playerId);
        if (!playersToRemove.length) {
            return;
        }

        playersToRemove.forEach(playerId => {
            delete battle.disconnectedPlayers[ playerId ];
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

        await battle.playerJoin(currentPlayerId);
    });

    private getPlayerDisconnectFn = (currentPlayerId: PlayerId) => () => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        if (!battle) {
            return;
        }

        battle.disconnectedPlayers[ currentPlayerId ] = Date.now();

        this.sendToEveryPlayersExcept(
            BattlePlayerDisconnectMessage({ playerId: currentPlayerId }),
            battle.staticPlayers,
            currentPlayerId
        );
    };
}
