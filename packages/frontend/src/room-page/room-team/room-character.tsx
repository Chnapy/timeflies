import { makeStyles } from '@material-ui/core';
import { UIButton } from '@timeflies/app-ui';
import { CharacterCategory, CharacterId, getCharacterCategory } from '@timeflies/common';
import { RoomCharacterRemoveMessage } from '@timeflies/socket-messages';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';

type RoomCharacterProps = {
    characterId: CharacterId;
};

type StyleProps = {
    characterCategory: CharacterCategory;
    sizeType: SizeType;
};

type SizeType = keyof typeof sizeMap;
const sizeMap = {
    'big': {
        size: 48,
        border: 4,
        scale: 2
    },
    'small': {
        size: 24,
        border: 2,
        scale: 1
    }
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ characterCategory, sizeType }: StyleProps) => ({
        width: sizeMap[ sizeType ].size,
        height: sizeMap[ sizeType ].size,
        minWidth: 0,
        padding: 0,
        paddingTop: '8px',
        borderLeftWidth: sizeMap[ sizeType ].border,
        borderLeftStyle: 'solid',
        borderLeftColor: palette.spellCategories[ characterCategory ]
    })
}));

export const RoomCharacter: React.FC<RoomCharacterProps> = ({ characterId }) => {
    const myPlayerId = useMyPlayerId();
    const characterRole = useRoomSelector(state => state.staticCharacterList[ characterId ].characterRole);
    const isMyCharacter = useRoomSelector(state => state.staticCharacterList[ characterId ].playerId === myPlayerId);

    const sizeType: SizeType = isMyCharacter ? 'big' : 'small';
    const characterCategory = getCharacterCategory(characterRole);
    const classes = useStyles({ characterCategory, sizeType });

    const sendRoomUpdate = useSendRoomUpdate();

    const spriteConfig: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation: 'bottom',
        state: 'idle'
    };

    const onRemove = () => sendRoomUpdate(RoomCharacterRemoveMessage({ characterId }));

    return (
        <UIButton className={classes.root} disabled={!isMyCharacter} onClick={onRemove}>
            <CharacterAnimatedImage
                size={sizeMap[ sizeType ].size - sizeMap[ sizeType ].border}
                scale={sizeMap[ sizeType ].scale}
                animationPath={SpritesheetsUtils.getCharacterAnimationPath(spriteConfig)}
                framesDurations={SpritesheetsUtils.getCharacterFramesDurations(spriteConfig)}
                framesOrder={SpritesheetsUtils.getCharacterFramesOrder(spriteConfig)}
                pingPong
            />
        </UIButton>
    )
};
