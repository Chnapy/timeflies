import { CharacterType } from '@timeflies/shared';
import React from 'react';
import { SpriteImage } from '../../sprite-image';
import { Avatar } from '@material-ui/core';

export type CharacterImageProps = {
    characterType: CharacterType;
    size: number;
};

const getTexturePath = (type: CharacterType) => `${type}/${type}_face.png`;

export const CharacterImage: React.FC<CharacterImageProps> = React.memo(({ characterType, size }) => {

    return <SpriteImage
        spritesheetKey='characters'
        textureKey={getTexturePath(characterType)}
        size={size}
        placeholder={<Avatar style={{ width: '100%', height: '100%' }} />}
    />;
});
