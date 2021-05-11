import { CharacterId, createPosition, Position } from '@timeflies/common';
import React from 'react';
import { useTiledMapAssets } from '../../../assets-loader/hooks/use-tiled-map-assets';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useSpriteMoveUpdateTicker } from './use-sprite-move-update-ticker';

export const useSpritePositionUpdate = (characterId: CharacterId) => {

    const tiledMapAssets = useTiledMapAssets();

    const position = useCurrentEntities(({ characters }) => characters.position[ characterId ]);

    const tilesize = tiledMapAssets ? tiledMapAssets.schema.tileheight : 0;

    const computePosition = React.useCallback((x: number, y: number) => createPosition(
        x * tilesize + tilesize / 2,
        y * tilesize + tilesize / 3
    ), [ tilesize ]);

    const [ spritePosition, setStaticPosition ] = React.useReducer((oldPosition: Position, newPosition: Position) => {
        return oldPosition.id === newPosition.id
            ? oldPosition
            : newPosition;
    }, computePosition(position.x, position.y));

    const updateSpritePosition = React.useCallback((x: number, y: number) => {
        setStaticPosition(computePosition(x, y));
    }, [ computePosition ]);

    useSpriteMoveUpdateTicker(
        characterId,
        React.useCallback((prevPos, nextPos, stepElapsedPercent) => {
            updateSpritePosition(
                prevPos.x + (nextPos.x - prevPos.x) * stepElapsedPercent,
                prevPos.y + (nextPos.y - prevPos.y) * stepElapsedPercent
            );
        }, [ updateSpritePosition ]),
        React.useCallback(() => {
            updateSpritePosition(position.x, position.y);
        }, [ updateSpritePosition, position ])
    );

    return spritePosition;
};
