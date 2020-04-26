import { Position, SpellType } from '@timeflies/shared';
import { IGameAction } from '../../../action/game-action/GameAction';
import { BStateAction } from '../battleState/BattleStateSchema';
import { MapManager } from '../map/MapManager';
import { ExtractHoverReturn } from './spellMapping';
import { Spell } from '../entities/spell/Spell';

export interface SpellEngineBindAction<ST extends SpellType = SpellType> extends IGameAction<'battle/spell-engine/bind'> {
    spell: Spell<'future'>;
    rangeArea: Position[];
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
