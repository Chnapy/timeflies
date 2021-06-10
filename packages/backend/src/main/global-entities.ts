import { PlayerId } from '@timeflies/common';
import { PlayerCredentials } from '@timeflies/socket-messages';
import { Battle, BattleId } from '../services/battle/battle';
import { Room, RoomId } from '../services/room/room';
import { createServices, Services } from '../services/services';

export type PlayerCredentialsMap = {
    mapById: { [ playerId in PlayerId ]: PlayerCredentials };
    mapByToken: { [ token in string ]: PlayerCredentials };
    mapByPlayerName: { [ playerName in string ]: PlayerCredentials };
};

type RoomMapById = { [ roomId in RoomId ]?: Room };
type RoomMapByPlayerId = { [ playerId in PlayerId ]?: Room };
export type CurrentRoomMap = {
    mapById: RoomMapById;
    mapByPlayerId: RoomMapByPlayerId;
};

type BattleMapById = { [ battleId in BattleId ]?: Battle };
type BattleMapByPlayerId = { [ playerId in PlayerId ]?: Battle };
export type CurrentBattleMap = {
    mapById: BattleMapById;
    mapByPlayerId: BattleMapByPlayerId;
};

export type GlobalEntities = {
    readonly playerCredentialsMap: PlayerCredentialsMap;
    readonly currentRoomMap: CurrentRoomMap;
    readonly currentBattleMap: CurrentBattleMap;
    readonly services: Services;
};
export type GlobalEntitiesNoServices = Omit<GlobalEntities, 'services'>;

export const createGlobalEntities = (): GlobalEntities => {
    const globalEntitiesNoServices: GlobalEntitiesNoServices = {
        playerCredentialsMap: {
            mapById: {},
            mapByToken: {},
            mapByPlayerName: {}
        },
        currentRoomMap: {
            mapById: {},
            mapByPlayerId: {}
        },
        currentBattleMap: {
            mapById: {},
            mapByPlayerId: {}
        }
    };

    const services = createServices(globalEntitiesNoServices);

    const globalEntities: GlobalEntities = {
        ...globalEntitiesNoServices,
        services
    };

    return globalEntities;
};
