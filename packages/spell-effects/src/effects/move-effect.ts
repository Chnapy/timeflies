import { getOrientationFromTo, Position } from '@timeflies/common';
import { Area } from '@timeflies/tilemap-utils';
import { isTileInRangeArea } from '../compute-action-area';
import { SpellEffectHelper, SpellEffectItem } from '../spell-effects-fn';
import { SpellEffect } from '../spell-effects-params';

const pathfinder = Area.getPathfinderInstance();

const getEmptyEffect = (): Partial<SpellEffect> => ({ actionArea: [] });

export const moveEffect: SpellEffectItem = {
    effect: async (helper) => {

        // compute path, which is specific for 'move' spell
        const rawActionArea = await computeActionArea(helper);
        if (rawActionArea.length === 0) {
            return getEmptyEffect();
        }

        const launcher = helper.getLauncher();

        const turnStartTime = helper.params.context.currentTurn.startTime;
        const { launchTime } = helper.params.partialSpellAction;

        const turnEndTime = turnStartTime + launcher.actionTime;
        const remainingTime = turnEndTime - launchTime;

        const nbrTiles = Math.max(
            Math.min(
                rawActionArea.length,
                Math.floor(remainingTime / helper.getDefaultDuration())
            ),
            0);
        if (nbrTiles === 0) {
            return getEmptyEffect();
        }

        const actionArea = rawActionArea.slice(0, nbrTiles);
        const duration = actionArea.length * helper.getDefaultDuration();

        const fullActionArea = [ launcher.position, ...actionArea ];
        const [ beforeLastPos, lastPos ] = fullActionArea.slice(fullActionArea.length - 2);

        const orientation = getOrientationFromTo(beforeLastPos, lastPos);

        return {
            duration,
            actionArea,
            characters: {
                [ launcher.characterId ]: {
                    position: lastPos,
                    orientation
                }
            },
        };
    }
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
