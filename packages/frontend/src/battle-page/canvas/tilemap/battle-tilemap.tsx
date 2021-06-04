import { TilemapComponent, TilemapComponentProps } from '@timeflies/tilemap-component';
import { Texture } from 'pixi.js';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { useCurrentActionArea } from '../../action-preview/hooks/use-current-action-area';
import { useActionPreviewContext } from '../../action-preview/view/action-preview-context';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useCurrentEntities, useFutureEntities } from '../../hooks/use-entities';
import { useRangeAreaContext } from '../../range-area/view/range-area-context';
import { useLaunchSpellAction } from '../../spell-action/hooks/use-launch-spell-action';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useTileHoverDispatchContext } from '../../tile-interactive/view/tile-hover-context';
import { BattleCharacterCurrentSprite } from '../character-sprite/battle-character-current-sprite';
import { BattleCharacterFutureSprite } from '../character-sprite/battle-character-future-sprite';

const imagesLinksToTextures = (links: Record<string, string>) => {
    return Object.entries(links).reduce<Record<string, Texture>>((acc, [ key, source ]) => {
        acc[ key ] = Texture.from(source);
        return acc;
    }, {});
};

export const BattleTilemap: React.FC = () => {
    const tiledMapAssets = useTiledMapAssets();

    const characterList = useBattleSelector(battle => battle.characterList);
    const currentPositions = useCurrentEntities(({ characters }) => characters.position);
    const futurePositions = useFutureEntities(({ characters }) => characters.position);

    const dispatchTileHover = useTileHoverDispatchContext();
    const launchSpellAction = useLaunchSpellAction();

    const { rangeArea } = useRangeAreaContext();
    const { actionArea } = useActionPreviewContext().spellEffectPreview;
    const currentActionArea = useCurrentActionArea();

    const tilesRange = rangeArea.reduce<TilemapComponentProps[ 'tilesRange' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const tilesAction = actionArea.reduce<TilemapComponentProps[ 'tilesAction' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const tilesCurrentAction = currentActionArea.reduce<TilemapComponentProps[ 'tilesCurrentAction' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const characterMap = characterList.reduce<TilemapComponentProps[ 'children' ]>((acc, characterId) => {

        const currentPos = currentPositions[ characterId ];
        const futurePos = futurePositions[ characterId ];

        const characterFragment = <React.Fragment key={characterId}>
            {currentPos && (
                <BattleCharacterCurrentSprite characterId={characterId} />
            )}
            {futurePos && (
                <BattleCharacterFutureSprite characterId={characterId} />
            )}
        </React.Fragment>;

        const characterMapId = (currentPos || futurePos).id;
        acc[characterMapId] = acc[characterMapId] ?? [];
        acc[characterMapId]!.push(characterFragment);

        return acc;
    }, {});

    const onTouchEnd = async () => {
        await launchSpellAction();
        dispatchTileHover(null);
    };

    return (
        <Container interactive click={launchSpellAction} touchend={onTouchEnd}>
            {tiledMapAssets && <TilemapComponent
                mapSheet={tiledMapAssets.schema}
                mapTexture={imagesLinksToTextures(tiledMapAssets.images)}
                tilesRange={tilesRange}
                tilesAction={tilesAction}
                tilesCurrentAction={tilesCurrentAction}
                onTileMouseHover={dispatchTileHover}
            >
                {characterMap}
            </TilemapComponent>}
        </Container>
    );
};
