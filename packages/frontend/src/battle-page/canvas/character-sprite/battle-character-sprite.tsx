import { useTheme } from '@material-ui/core';
import { AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { useAssetMap, useAssetSpritesheet } from '@timeflies/assets-loader';
import { CharacterId, switchUtil } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import * as PIXI from 'pixi.js';
import React from 'react';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { colorStringToHex } from '../color-string-to-hex';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const { characterRole, playerId } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const orientation = useBattleSelector(battle => battle.currentCharacters.orientation[ characterId ]);
    const position = useBattleSelector(battle => battle.currentCharacters.position[ characterId ]);

    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapAssets = useAssetMap(tiledMapName) ?? null;

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
            outline={{ color: outlineColor, thickness: 1 }}
        />
    </>;
};
