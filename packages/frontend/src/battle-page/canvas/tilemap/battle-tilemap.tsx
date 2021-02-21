import { useAssetMap } from '@timeflies/assets-loader';
import { TilemapComponent, TilemapComponentProps } from '@timeflies/tilemap-component';
import { Texture } from 'pixi.js';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattleCharacterSprite } from '../character-sprite/battle-character-sprite';

const imagesLinksToTextures = (links: Record<string, string>) => {
    return Object.entries(links).reduce<Record<string, Texture>>((acc, [ key, source ]) => {
        acc[ key ] = Texture.from(source);
        return acc;
    }, {});
};

export const BattleTilemap: React.FC = () => {
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapAssets = useAssetMap(tiledMapName) ?? null;

    const characterList = useBattleSelector(battle => battle.characterList);
    const positions = useBattleSelector(battle => battle.currentCharacters.position);
    const characterMap = characterList.reduce<TilemapComponentProps[ 'children' ]>((acc, characterId) => {
        acc[ positions[ characterId ].id ] = {
            id: characterId,
            sprite: <BattleCharacterSprite characterId={characterId} />
        };

        return acc;
    }, {});

    return (
        <Container>
            {tiledMapAssets && <TilemapComponent
                mapSheet={tiledMapAssets.schema}
                mapTexture={imagesLinksToTextures(tiledMapAssets.images)}
                tilesRange={[]}
                tilesAction={[]}
                tilesCurrentAction={[]}
                onTileMouseHover={pos => {
                    console.log('tile', pos?.id);
                }}
            >
                {characterMap}
            </TilemapComponent>}
        </Container>
    );
};
