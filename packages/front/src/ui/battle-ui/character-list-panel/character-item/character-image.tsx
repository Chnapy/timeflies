import { CharacterRole } from '@timeflies/shared';
import React from 'react';
import { SpriteImage } from '../../sprite-image';
import { Avatar } from '@material-ui/core';

export type CharacterImageProps = {
    characterRole: CharacterRole;
    size: number;
};

const getTexturePath = (type: CharacterRole) => `${type}/${type}_face.png`;

export const CharacterImage: React.FC<CharacterImageProps> = React.memo(({ characterRole, size }) => {

    return <SpriteImage
        spritesheetKey='characters'
        textureKey={getTexturePath(characterRole)}
        size={size}
        placeholder={<Avatar style={{ width: '100%', height: '100%' }} />}
    />;
});
