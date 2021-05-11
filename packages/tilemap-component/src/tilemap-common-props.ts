import { Position } from '@timeflies/common';
import { TiledMap } from 'tiled-types';
import * as PIXI from 'pixi.js';

export type TilemapCommonProps = {
    mapSheet: TiledMap;
    mapTexture: { [ name: string ]: PIXI.Texture };
    onTileMouseHover: (tilePos: Position | null) => void;
};

export type TilemapCharacters = {
    [ positionId in Position['id'] ]?: React.ReactElement;
};

export type TilemapTileState = {
    [ positionId in Position['id'] ]?: boolean;
};
