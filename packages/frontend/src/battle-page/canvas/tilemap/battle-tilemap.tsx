import { TilemapComponent, TilemapComponentProps } from '@timeflies/tilemap-component';
import { Texture } from 'pixi.js';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { useTiledMapAssets } from '../../hooks/use-tiled-map-assets';
import { useComputeRangeArea } from '../../spell-select/hooks/use-compute-range-area';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
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
    const positions = useBattleSelector(battle => battle.currentCharacters.position);
    const rangeArea = useComputeRangeArea();

    const tilesRange = rangeArea.reduce<TilemapComponentProps[ 'tilesRange' ]>((acc, pos) => {
        acc[ pos.id ] = true;
        return acc;
    }, {});

    const characterMap = characterList.reduce<TilemapComponentProps[ 'children' ]>((acc, characterId) => {
        acc[ positions[ characterId ].id ] = <BattleCharacterSprite characterId={characterId} />;

        return acc;
    }, {});

    return (
        <Container>
            {tiledMapAssets && <TilemapComponent
                mapSheet={tiledMapAssets.schema}
                mapTexture={imagesLinksToTextures(tiledMapAssets.images)}
                tilesRange={tilesRange}
                tilesAction={{}}
                tilesCurrentAction={{}}
                onTileMouseHover={pos => {
                }}
            >
                {characterMap}
            </TilemapComponent>}
        </Container>
    );
};
