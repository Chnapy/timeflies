import { useTheme } from '@material-ui/core';
import { AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { useAssetSpritesheet } from '@timeflies/assets-loader';
import { CharacterId, colorStringToHex, switchUtil } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useCurrentEntities, useFutureEntities } from '../../hooks/use-entities';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterFutureSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const { characterRole, playerId } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const futureOrientation = useFutureEntities(({ characters }) => characters.orientation[ characterId ]);
    const futurePosition = useFutureEntities(({ characters }) => characters.position[ characterId ]);
    const isPlaying = useBattleSelector(battle => battle.playingCharacterId === characterId);
    const sameAsCurrent = useCurrentEntities(({ characters }) =>
        characters.orientation[ characterId ] === futureOrientation
        && characters.position[ characterId ].id === futurePosition.id
    );

    const tiledMapAssets = useTiledMapAssets();

    const spritesheet = useAssetSpritesheet('entities')?.spritesheet;

    const getPlayerRelationFrom = usePlayerRelationFrom();
    const playerRelationsColors = useTheme().palette.playerRelations;

    if (!spritesheet || !tiledMapAssets || sameAsCurrent) {
        return null;
    }

    const outlineColor = colorStringToHex(
        switchUtil(getPlayerRelationFrom(playerId), playerRelationsColors)
    );

    const { tileheight } = tiledMapAssets.schema;
    const mapPosition = new PIXI.Point(
        futurePosition.x * tileheight + tileheight / 2,
        futurePosition.y * tileheight + tileheight / 3
    );

    const config: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation: futureOrientation,
        state: 'idle'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(config);
    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(config);

    return <>
        <AnimatedComplexSpriteReact
            run={false}
            spritesheet={spritesheet}
            animationPath={animationPath}
            framesDurations={framesDurations}
            pingPong={false}
            scale={0.75}
            anchor={0.5}
            position={mapPosition}
            outline={{ color: outlineColor, thickness: isPlaying ? 2 : 1 }}
            alpha={0.5}
        />
    </>;
};
