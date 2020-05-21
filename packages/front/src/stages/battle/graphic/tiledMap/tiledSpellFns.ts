import { equals, assertIsDefined } from '@timeflies/shared';
import { TileGraphic } from './TileGraphic';
import { TiledMapSpellObject } from '../../engine/spellMapping';


export const tiledMapSpellMove: TiledMapSpellObject<'move'> = {
    onHoverFn: ({ engineProps, tileGraphicList }) => {
        const { path } = engineProps;

        const tileGraphicPath = path
            .slice(1)
            .map(p => tileGraphicList.find(tile => equals(p)(tile.tilePos))!);

        tileGraphicPath.forEach((t, i) => t.showPath(i === tileGraphicPath.length - 1));

        return startTime => {
            tileGraphicPath.forEach(t => t.persistAction(startTime));
        }
    },
    onSpellStartFn: ({
        tileGraphicList, startTime, duration, position
    }) => {
        const tilePos = tileGraphicList.find(t => equals(t.tilePos)(position));
        assertIsDefined(tilePos);

        tilePos.persistActionStart(duration, startTime);
    }
};

export const tiledMapSpellSimpleAttack: TiledMapSpellObject<'simpleAttack'> = {
    onHoverFn: ({ engineProps, tileGraphicList, rangeTiles }) => {
        const { actionArea } = engineProps;

        const tileGraphicArea = actionArea
            .map(p => tileGraphicList.find(tile => equals(p)(tile.tilePos))!);

        const isInRange = (tileGraphic: TileGraphic) => rangeTiles.includes(tileGraphic);

        tileGraphicArea.forEach(t => t.showAction(isInRange(t)));

        return startTime => {
            tileGraphicArea.forEach(t => t.persistAction(startTime));
        };
    },
    onSpellStartFn: ({
        tileGraphicList, startTime, duration, position
    }) => {
        const tilePos = tileGraphicList.find(t => equals(t.tilePos)(position));
        assertIsDefined(tilePos);

        tilePos.persistActionStart(duration, startTime);
    }
};
