import { PlayerId } from '@timeflies/common';
import { Battle, BattleId } from '../services/battle/battle';
import { createServices, Services } from '../services/services';

type BattleMapById = { [ battleId in BattleId ]?: Battle };
type BattleMapByPlayerId = { [ playerId in PlayerId ]?: Battle };
export type CurrentBattleMap = {
    mapById: BattleMapById;
    mapByPlayerId: BattleMapByPlayerId;
};

export type GlobalEntities = {
    readonly currentBattleMap: CurrentBattleMap;
    readonly services: Services;
};
export type GlobalEntitiesNoServices = Omit<GlobalEntities, 'services'>;

export const createGlobalEntities = (): GlobalEntities => {
    const globalEntitiesNoServices: GlobalEntitiesNoServices = {
        currentBattleMap: {
            mapById: {},
            mapByPlayerId: {}
        }
    };

    const services = createServices(globalEntitiesNoServices);

    return {
        ...globalEntitiesNoServices,
        services
    };
};
