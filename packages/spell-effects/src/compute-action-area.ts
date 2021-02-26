import { Position } from '@timeflies/common';
import { Area, Tile } from '@timeflies/tilemap-utils';
import { SpellEffectFnParams } from './spell-effects-params';

export const computeActionArea = ({ partialSpellAction: spellAction, context }: SpellEffectFnParams): Position[] => {
    const { spellId, targetPos } = spellAction;

    const { tiledMap, rangeArea } = context.map;

    const actionAreaValue = context.state.spells.actionArea[ spellId ];

    if (!isTileInRangeArea(rangeArea, targetPos)) {
        return [];
    }

    return Area.getArea(targetPos, actionAreaValue, tiledMap)
        .filter(p => Tile.getTileTypeFromPosition(p, tiledMap) === 'default');
};

export const isTileInRangeArea = (rangeArea: Position[], targetPos: Position) => rangeArea.some(p => p.id === targetPos.id);
