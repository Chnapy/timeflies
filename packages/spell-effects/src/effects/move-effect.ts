import { getOrientationFromTo, Position } from '@timeflies/common';
import { Area } from '@timeflies/tilemap-utils';
import { isTileInRangeArea } from '../compute-action-area';
import { SpellEffectFn, SpellEffectHelper } from '../spell-effects-fn';

const pathfinder = Area.getPathfinderInstance();

export const moveEffect: SpellEffectFn = async (helper) => {

    // compute path, which is specific for 'move' spell
    const actionArea = await computeActionArea(helper);
    if(actionArea.length === 0) {
        return {};
    }

    const duration = actionArea.length * helper.getDefaultDuration();

    const launcher = helper.getLauncher();

    const fullActionArea = [ launcher.position, ...actionArea ];
    const [ beforeLastPos, lastPos ] = fullActionArea.slice(fullActionArea.length - 2);

    const orientation = getOrientationFromTo(beforeLastPos, lastPos);

    return {
        duration,
        characters: {
            [ launcher.characterId ]: {
                position: helper.targetPos,
                orientation
            }
        },
    };
};

/**
 * Return move path.
 */
const computeActionArea = async (helper: SpellEffectHelper): Promise<Position[]> => {
    const launcher = helper.getLauncher();

    const { map, state } = helper.params.context;

    if (!isTileInRangeArea(map.rangeArea, helper.targetPos)) {
        return [];
    }

    const path = await pathfinder.calculatePath(
        map.tiledMap, state.characters.position,
        launcher.position, helper.targetPos
    );
    return path.slice(1);
};
