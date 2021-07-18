import { makeStyles, Tooltip } from '@material-ui/core';
import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import { CharacterCategory, CharacterId, getCharacterCategory } from '@timeflies/common';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import clsx from 'clsx';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';

type RoomCharacterButtonProps = Omit<UIButtonProps, 'size'> & {
    characterId: CharacterId;
    size?: number;
    borderWidth?: number;
    scale?: number;
    focus?: boolean;
};

type StyleProps = {
    size: number;
    borderWidth: number;
    focus: boolean;
    characterCategory: CharacterCategory;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ size, borderWidth, focus, characterCategory }: StyleProps) => ({
        width: size,
        height: size,
        minWidth: 0,
        padding: 0,
        paddingTop: '8px',
        borderLeftWidth: borderWidth,
        borderLeftStyle: 'solid',
        borderLeftColor: palette.spellCategories[ characterCategory ],
        outlineStyle: 'solid',
        outlineWidth: focus ? 2 : 0
    })
}));

export const RoomCharacterButton: React.FC<RoomCharacterButtonProps> = React.memo(({
    characterId,
    size = 48,
    borderWidth = 4,
    scale = 2,
    focus = false,
    className,
    ...rest
}) => {
    const characterRole = useRoomSelector(state => state.staticCharacterList[ characterId ].characterRole);
    const playerName = useRoomSelector(state => state.staticPlayerList[ state.staticCharacterList[ characterId ].playerId ].playerName);

    const characterCategory = getCharacterCategory(characterRole);
    const classes = useStyles({ size, borderWidth, focus, characterCategory });

    const spriteConfig: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation: 'bottom',
        state: 'idle'
    };

    return (
        <Tooltip open={focus} title={playerName} placement='bottom' arrow>
            <UIButton className={clsx(classes.root, className)} {...rest}>
                <CharacterAnimatedImage
                    size={size - borderWidth}
                    scale={scale}
                    animationPath={SpritesheetsUtils.getCharacterAnimationPath(spriteConfig)}
                    framesDurations={SpritesheetsUtils.getCharacterFramesDurations(spriteConfig)}
                    framesOrder={SpritesheetsUtils.getCharacterFramesOrder(spriteConfig)}
                    pingPong
                />
            </UIButton>
        </Tooltip>
    );
});
