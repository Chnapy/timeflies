import { TileHoverFnProps } from './TiledMapGraphic';
import { equals } from '@timeflies/shared';


export const onMoveTileHover = ({ engineProps, tileGraphicList }: TileHoverFnProps<'move'>) => {
    const { path } = engineProps;

    const tileGraphicPath = path
        .slice(1)
        .map(p => tileGraphicList.find(tile => equals(p)(tile.tilePos))!);

    tileGraphicPath.forEach(t => t.showPath());
};

export const onSimpleAttackTileHover = ({ engineProps, tileGraphicList }: TileHoverFnProps<'simpleAttack'>) => {
    const { actionArea } = engineProps;

    const tileGraphicArea = actionArea
        .map(p => tileGraphicList.find(tile => equals(p)(tile.tilePos))!);

    tileGraphicArea.forEach(t => t.showAction());
};

