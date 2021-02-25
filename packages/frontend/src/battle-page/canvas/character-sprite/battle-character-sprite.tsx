import { useTheme } from '@material-ui/core';
import { AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { useAssetSpritesheet } from '@timeflies/assets-loader';
import { CharacterId, colorStringToHex, switchUtil } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useCurrentEntities } from '../../hooks/use-entities';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const { characterRole, playerId } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const orientation = useCurrentEntities(({ characters }) => characters.orientation[ characterId ]);
    const position = useCurrentEntities(({ characters }) => characters.position[ characterId ]);
    const isPlaying = useBattleSelector(battle => battle.playingCharacterId === characterId);

    const tiledMapAssets = useTiledMapAssets();

    const spritesheet = useAssetSpritesheet('entities')?.spritesheet;

    const getPlayerRelationFrom = usePlayerRelationFrom();
    const playerRelationsColors = useTheme().palette.playerRelations;

    if (!spritesheet || !tiledMapAssets) {
        return null;
    }

    const outlineColor = colorStringToHex(
        switchUtil(getPlayerRelationFrom(playerId), playerRelationsColors)
    );

    const { tileheight } = tiledMapAssets.schema;
    const mapPosition = new PIXI.Point(
        position.x * tileheight + tileheight / 2,
        position.y * tileheight + tileheight / 3
    );

    const config: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation,
        state: 'idle'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(config);
    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(config);

    const pingPong = config.state === 'idle';

    return <>
        <AnimatedComplexSpriteReact
            spritesheet={spritesheet}
            animationPath={animationPath}
            framesDurations={framesDurations}
            pingPong={pingPong}
            scale={0.75}
            anchor={0.5}
            position={mapPosition}
            outline={{ color: outlineColor, thickness: isPlaying ? 2 : 1 }}
        />
    </>;
};
