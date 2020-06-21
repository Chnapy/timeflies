import { assertIsDefined } from '@timeflies/shared';
import { TiledMapSpellObject } from '../../engine/spellMapping';


export const tiledMapSpellMove: TiledMapSpellObject = {
    onHoverFn: ({ tileGraphicList }) => {
        return startTime => {
        }
    },
    onSpellStartFn: ({
        tileGraphicList, startTime, duration, position
    }) => {
        const tilePos = tileGraphicList[ position.id ];
        assertIsDefined(tilePos);

        tilePos.persistActionStart(duration, startTime);
    }
};

export const tiledMapSpellSimpleAttack: TiledMapSpellObject = {
    onHoverFn: ({ tileGraphicList, rangeTiles }) => {
        return startTime => {
        };
    },
    onSpellStartFn: ({
        tileGraphicList, startTime, duration, position
    }) => {
        const tilePos = tileGraphicList[ position.id ];
        assertIsDefined(tilePos);

        tilePos.persistActionStart(duration, startTime);
    }
};
