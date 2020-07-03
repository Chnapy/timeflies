import { SpellRole } from '@timeflies/shared';
import React from 'react';
import { SpriteImage } from '../../sprite-image';

export type SpellImageProps = {
    spellRole: SpellRole;
    size: number;
};

const getTexturePath = (spellRole: SpellRole) => `${spellRole}.png`;

export const SpellImage: React.FC<SpellImageProps> = React.memo(({ spellRole, size }) => {
    
    return (
        <SpriteImage
            spritesheetKey='spells'
            textureKey={getTexturePath(spellRole)}
            size={size}
        />
    );
});
