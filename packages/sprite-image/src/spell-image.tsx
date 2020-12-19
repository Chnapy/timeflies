import { SpellRole } from '@timeflies/common';
import React from 'react';
import { SpriteImage, SpriteImageProps } from './sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';

export type SpellImageProps = Omit<SpriteImageProps, 'textureKey'> & {
    spellRole: SpellRole
};

export const SpellImage: React.FC<SpellImageProps> = ({ spellRole, ...spriteProps }) => {
    const textureKey = SpritesheetsUtils.getSpellTextureKey(spellRole);

    return <SpriteImage
        textureKey={textureKey}
        {...spriteProps}
    />;
};
