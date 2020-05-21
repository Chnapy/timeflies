import { SpellType } from '@timeflies/shared';
import React from 'react';
import { SpriteImage } from '../../sprite-image';

export type SpellImageProps = {
    spellType: SpellType;
    size: number;
}

const getTexturePath = (spellType: SpellType) => `${spellType}.png`;

export const SpellImage: React.FC<SpellImageProps> = React.memo(({ spellType, size }) => {
    
    return (
        <SpriteImage
            spritesheetKey='spells'
            textureKey={getTexturePath(spellType)}
            size={size}
        />
    );
});
