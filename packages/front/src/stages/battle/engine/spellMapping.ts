import { inferFn, SpellType, SpellActionSnapshot } from '@timeflies/shared';
import { TileHoverFnProps } from '../graphic/tiledMap/TiledMapGraphic';
import { tiledMapSpellMove, tiledMapSpellSimpleAttack } from '../graphic/tiledMap/tiledSpellFns';
import { SpellAction } from '../spellAction/spell-action-reducer';
import { Character } from '../entities/character/Character';
import { TileGraphic } from '../graphic/tiledMap/TileGraphic';
import { spellLaunchMove } from './spellEngine/move/spell-engine-move';
import { spellLaunchSimpleAttack } from './spellEngine/simpleAttack/spell-engine-simpleAttack';

type TiledMapHoverFn<ST extends SpellType> = (props: TileHoverFnProps) => (startTime: number) => void;

type TiledMapStartFn = (props: Pick<SpellActionSnapshot,
    | 'startTime'
    | 'position'
    | 'actionArea'
    | 'duration'
> & {
    tileGraphicList: TileGraphic[];
}) => void;

export type TiledMapSpellObject<ST extends SpellType> = {
    onHoverFn: TiledMapHoverFn<ST>;
    onSpellStartFn: TiledMapStartFn;
};

interface SpellMapValue<ST extends SpellType, HR> {
    launchFn: (spellAction: SpellAction, characterList: Character<'future'>[]) => void;
    // prepareEngine: SpellPrepareSubEngineCreator<HR>;
}

// interface SpellMapGraphicValue<ST extends SpellType, HR> {
//     tiledMapObject: TiledMapSpellObject<ST>;
//     characterObject?: {
//         onHoverFn: (props: {
//             engineProps: HR;
//         }) => void;
//     };
// }

// type SpellMap = typeof spellMap;

// export type ExtractHoverReturn<ST extends SpellType> = SpellMap[ ST ][ 'prepareEngine' ] extends
//     SpellPrepareSubEngineCreator<infer HR> ? HR : never;

const spellMap = inferFn<{
    [ ST in SpellType ]: SpellMapValue<ST, any>
}>()({
    move: {
        launchFn: spellLaunchMove,
        // prepareEngine: SpellPrepareMove
    },
    orientate: {
        launchFn: spellLaunchMove,
        // prepareEngine: SpellPrepareMove
    },
    simpleAttack: {
        launchFn: spellLaunchSimpleAttack,
        // prepareEngine: SpellPrepareSimpleAttack
    },
    sampleSpell1: {
        launchFn: spellLaunchMove,
        // prepareEngine: SpellPrepareMove
    },
    sampleSpell2: {
        launchFn: spellLaunchMove,
        // prepareEngine: SpellPrepareMove
    },
    sampleSpell3: {
        launchFn: spellLaunchMove,
        // prepareEngine: SpellPrepareMove
    }
});

const spellMapGraphic: {
    // [ ST in SpellType ]: SpellMapGraphicValue<ST, ExtractHoverReturn<ST>>;
} = {
    move: {
        tiledMapObject: tiledMapSpellMove,
    },
    orientate: {
        tiledMapObject: {
            onHoverFn: () => () => { },
            onSpellStartFn: () => { }
        },
    },
    simpleAttack: {
        tiledMapObject: tiledMapSpellSimpleAttack,
    },
    sampleSpell1: {
        tiledMapObject: {
            onHoverFn: () => () => { },
            onSpellStartFn: () => { }
        },
    },
    sampleSpell2: {
        tiledMapObject: {
            onHoverFn: () => () => { },
            onSpellStartFn: () => { }
        },
    },
    sampleSpell3: {
        tiledMapObject: {
            onHoverFn: () => () => { },
            onSpellStartFn: () => { }
        },
    }
};

export const getSpellLaunchFn = (spellType: SpellType) =>
    spellMap[ spellType ].launchFn;

export const getTiledMapSpellObject = (spellType: SpellType) =>
    spellMapGraphic[ spellType ].tiledMapObject;
