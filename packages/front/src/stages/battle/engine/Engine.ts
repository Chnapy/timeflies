import { BattleStateAction } from '../battleState/battle-state-actions';
import { MapManager } from '../map/MapManager';

interface Dependencies {
    mapManager: MapManager;
}

export interface EngineCreatorParam<
    E extends BattleStateAction | undefined
    > {
    event: E;
    deps: Dependencies;
}

export interface EngineCreator<
    E extends BattleStateAction | undefined,
    O extends any[] = []
    > {
    (param: EngineCreatorParam<E>, ...O): {
        stop(): void;
    };
}
