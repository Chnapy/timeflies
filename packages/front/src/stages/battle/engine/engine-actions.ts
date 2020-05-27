import { createAction } from '@reduxjs/toolkit';
import { Position, SpellType } from '@timeflies/shared';
import { Spell } from '../entities/spell/Spell';
import { ExtractHoverReturn } from './spellMapping';

export type SpellEngineBindAction = ReturnType<typeof SpellEngineBindAction>;
export const SpellEngineBindAction = createAction<{
    spell: Spell<'future'>;
    rangeArea: Position[];
    onTileHover: (tilePos: Position) => Promise<ExtractHoverReturn<SpellType>>;
    onTileClick: (tilePos: Position) => Promise<boolean>;
}>('battle/spell-engine/bind');
