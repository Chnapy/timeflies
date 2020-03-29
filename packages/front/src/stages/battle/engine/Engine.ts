import { Position } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { BStateAction } from '../battleState/BattleStateSchema';
import { MapManager } from '../map/MapManager';

export interface SpellEngineBindAction extends IGameAction<'battle/spell-engine/bind'> {
    onTileHover: (tilePos: Position) => Promise<void>;
    onTileClick: (tilePos: Position) => Promise<void>;
}

interface Dependencies {
    mapManager: MapManager;
}

export interface EngineCreatorParam<
    E extends BStateAction | undefined
    > {
    event: E;
    deps: Dependencies;
}

export interface EngineCreator<
    E extends BStateAction | undefined,
    O extends any[] = []
    > {
    (param: EngineCreatorParam<E>, ...O): {
        stop(): void;
    };
}
