import { Position, SpellType } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { BStateAction } from '../battleState/BattleStateSchema';
import { MapManager } from '../map/MapManager';
import { ExtractHoverReturn } from './spellMapping';

export interface SpellEngineBindAction<ST extends SpellType = SpellType> extends IGameAction<'battle/spell-engine/bind'> {
    spellType: ST;
    onTileHover: (tilePos: Position) => Promise<ExtractHoverReturn<ST>>;
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
