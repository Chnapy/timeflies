import { useTheme } from '@material-ui/core';
import { AnimatedComplexSprite, AnimatedComplexSpriteProps, FlipInfos, FramesInfos, OutlineInfos } from '@timeflies/animated-complex-sprite';
import { useAssetSpritesheet } from '@timeflies/assets-loader';
import { CharacterId, colorStringToHex, switchUtil } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import { DisplayObjectProps } from 'react-pixi-fiber';
import { useIsSpectator } from '../../../hooks/use-is-spectator';
import { usePlayerRelationFrom } from '../../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';

function removeUndefined<O>(o: O) {
    return Object.entries(o)
        .filter(([ key, value ]) => value !== undefined)
        .reduce((acc, [ key, value ]) => {

            (acc as any)[ key ] = value;

            return acc;
        }, {}) as O;
}

export const useCharacterSpriteInfos = (characterId: CharacterId) => {
    const { playerId } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const teamColor = useBattleSelector(battle => battle.staticPlayers[ playerId ].teamColor);
    const isPlaying = useBattleSelector(battle => battle.playingCharacterId === characterId);
    const isSpectator = useIsSpectator();

    const spritesheet = useAssetSpritesheet('entities')?.spritesheet;

    const getPlayerRelationFrom = usePlayerRelationFrom();
    const playerRelationsColors = useTheme().palette.playerRelations;

    const outlineColor = colorStringToHex(isSpectator
        ? teamColor!
        : switchUtil(getPlayerRelationFrom(playerId), playerRelationsColors)
    );

    const outline: OutlineInfos = {
        color: outlineColor,
        thickness: isPlaying ? 2 : 1
    };

    const getFramesInfos = (config: SpritesheetsUtils.CharacterSpriteConfig): FramesInfos => {

        const animationPath = SpritesheetsUtils.getCharacterAnimationPath(config);
        const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(config);
        const framesOrder = SpritesheetsUtils.getCharacterFramesOrder(config);

        const flipInfos = SpritesheetsUtils.getCharacterFlipInfos(config);
        const flip: FlipInfos | undefined = flipInfos
            ? {
                direction: flipInfos.direction,
                baseFramesInfos: getFramesInfos(flipInfos.flipConfig)
            }
            : undefined;


        const pingPong = config.state === 'idle';

        return {
            animationPath,
            framesDurations,
            pingPong,
            flip,
            framesOrder
        };
    };

    return (config: SpritesheetsUtils.CharacterSpriteConfig): AnimatedComplexSpriteProps & DisplayObjectProps<AnimatedComplexSprite> | null => {

        if (!spritesheet) {
            return null;
        }

        const framesInfos = getFramesInfos(config);

        return removeUndefined({
            spritesheet,
            ...framesInfos,
            scale: 0.75,
            anchor: 0.5,
            outline
        });
    };
};
