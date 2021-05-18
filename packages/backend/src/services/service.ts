import { PlayerId } from '@timeflies/common';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { BattleId } from './battle/battle';

export type PlayerSocketMap = { [ playerId in PlayerId ]: SocketCell };

export abstract class Service {

    protected globalEntitiesNoServices: GlobalEntitiesNoServices;
    protected playerSocketMap: PlayerSocketMap = {};

    constructor(globalEntitiesNoServices: GlobalEntitiesNoServices) {
        this.globalEntitiesNoServices = globalEntitiesNoServices;
    }

    protected abstract afterSocketConnect(socketCell: SocketCell, currentPlayerId: PlayerId): void;

    protected getBattleById = (battleId: BattleId) => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapById[ battleId ];
        if (!battle) {
            throw new SocketError(400, 'battle id does not exist: ' + battleId);
        }

        return battle;
    };

    protected getBattleByPlayerId = (playerId: PlayerId) => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ playerId ];
        if (!battle) {
            throw new SocketError(400, 'player is not in battle: ' + playerId);
        }

        return battle;
    };

    onSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.playerSocketMap[ currentPlayerId ] = socketCell;
        socketCell.addDisconnectListener(() => {
            delete this.playerSocketMap[ currentPlayerId ];
        });

        this.afterSocketConnect(socketCell, currentPlayerId);
    };
};
