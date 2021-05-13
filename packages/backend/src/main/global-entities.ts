import { Battle, BattleId } from '../services/battle/battle';
import { createServices, Services } from '../services/services';

export type CurrentBattleMap = { [ battleId in BattleId ]?: Battle };

export type GlobalEntities = {
    readonly currentBattleMap: CurrentBattleMap;
    readonly services: Services;
};
export type GlobalEntitiesNoServices = Omit<GlobalEntities, 'services'>;

export const createGlobalEntities = (): GlobalEntities => {
    const globalEntitiesNoServices: GlobalEntitiesNoServices = { currentBattleMap: {} };

    const services = createServices(globalEntitiesNoServices);

    return {
        ...globalEntitiesNoServices,
        services
    };
};
