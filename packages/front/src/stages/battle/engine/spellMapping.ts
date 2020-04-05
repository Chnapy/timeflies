import { inferFn, SpellType } from '@timeflies/shared';
import { TileHoverFnProps } from '../graphic/tiledMap/TiledMapGraphic';
import { SpellAction } from '../spellAction/SpellActionManager';
import { spellLaunchMove, SpellPrepareMove } from './spellEngine/move/SpellPrepareMove';
import { SpellPrepareSubEngineCreator } from './SpellPrepareEngine';
import { onMoveTileHover } from '../graphic/tiledMap/tiledSpellFns';

interface GraphicTriggerFn<ST extends SpellType, EngineReturn> {
    characterFn?: (props: {
        engineProps: EngineReturn;
    }) => void;
    tiledMapFn: (props: TileHoverFnProps<ST>) => void;
}

interface SpellMapValue<ST extends SpellType, HR> {
    launchFn: (spellAction: SpellAction) => void;
    prepareEngine: SpellPrepareSubEngineCreator<HR>;
}

interface SpellMapGraphicValue<ST extends SpellType, HR> {
    onHover: GraphicTriggerFn<ST, HR>;
    // TODO on spell action start (check CharacterGraphic actionFn)
}

type SpellMap = typeof spellMap;

export type ExtractHoverReturn<ST extends SpellType> = SpellMap[ ST ][ 'prepareEngine' ] extends
    SpellPrepareSubEngineCreator<infer HR> ? HR : never;

const spellMap = inferFn<{
    [ ST in SpellType ]: SpellMapValue<ST, any>
}>()({
    move: {
        launchFn: spellLaunchMove,
        prepareEngine: SpellPrepareMove
    },
    orientate: {
        launchFn: spellLaunchMove,
        prepareEngine: SpellPrepareMove
    },
    sampleSpell1: {
        launchFn: spellLaunchMove,
        prepareEngine: SpellPrepareMove
    },
    sampleSpell2: {
        launchFn: spellLaunchMove,
        prepareEngine: SpellPrepareMove
    },
    sampleSpell3: {
        launchFn: spellLaunchMove,
        prepareEngine: SpellPrepareMove
    }
});

const spellMapGraphic: {
    [ ST in SpellType ]: SpellMapGraphicValue<ST, ExtractHoverReturn<ST>>;
} = {
    move: {
        onHover: {
            tiledMapFn: onMoveTileHover
        }
    },
    orientate: {
        onHover: {
            tiledMapFn: () => { }
        }
    },
    sampleSpell1: {
        onHover: {
            tiledMapFn: () => { }
        }
    },
    sampleSpell2: {
        onHover: {
            tiledMapFn: () => { }
        }
    },
    sampleSpell3: {
        onHover: {
            tiledMapFn: () => { }
        }
    }
};

export const getSpellPrepareSubEngine = (spellType: SpellType) =>
    spellMap[ spellType ].prepareEngine;

export const getSpellLaunchFn = (spellType: SpellType) =>
    spellMap[ spellType ].launchFn;

export const getTiledMapHoverFn = (spellType: SpellType) =>
    spellMapGraphic[ spellType ].onHover.tiledMapFn;
