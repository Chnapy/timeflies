import { TilemapComponent, TilemapComponentProps } from '@timeflies/tilemap-component';
import { Texture } from 'pixi.js';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { useActionPreviewContext } from '../../action-preview/view/action-preview-context';
import { useCurrentEntities } from '../../hooks/use-entities';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useRangeAreaContext } from '../../range-area/view/range-area-context';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useTileClick } from '../../tile-interactive/hooks/use-tile-click';
import { useTileHoverDispatchContext } from '../../tile-interactive/view/tile-hover-context';
import { BattleCharacterSprite } from '../character-sprite/battle-character-sprite';

const imagesLinksToTextures = (links: Record<string, string>) => {
    return Object.entries(links).reduce<Record<string, Texture>>((acc, [ key, source ]) => {
        acc[ key ] = Texture.from(source);
        return acc;
    }, {});
};

export const BattleTilemap: React.FC = () => {
    const tiledMapAssets = useTiledMapAssets();

    const characterList = useBattleSelector(battle => battle.characterList);
    const positions = useCurrentEntities(({ characters }) => characters.position);

    const dispatchTileHover = useTileHoverDispatchContext();
    const tileClick = useTileClick();

    const { rangeArea } = useRangeAreaContext();
    const { actionArea } = useActionPreviewContext();

    const tilesRange = rangeArea.reduce<TilemapComponentProps[ 'tilesRange' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const tilesAction = actionArea.reduce<TilemapComponentProps[ 'tilesAction' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const characterMap = characterList.reduce<TilemapComponentProps[ 'children' ]>((acc, characterId) => {
        acc[ positions[ characterId ].id ] = <BattleCharacterSprite characterId={characterId} />;
        return acc;
    }, {});

    return (
        <Container interactive click={tileClick}>
            {tiledMapAssets && <TilemapComponent
                mapSheet={tiledMapAssets.schema}
                mapTexture={imagesLinksToTextures(tiledMapAssets.images)}
                tilesRange={tilesRange}
                tilesAction={tilesAction}
                tilesCurrentAction={{}}
                onTileMouseHover={dispatchTileHover}
            >
                {characterMap}
            </TilemapComponent>}
        </Container>
    );
};
