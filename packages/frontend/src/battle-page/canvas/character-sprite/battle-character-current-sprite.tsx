import { AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCharacterSpriteInfos } from './hooks/use-character-sprite-infos';
import { useSpriteGeoUpdate } from './hooks/use-sprite-geo-update';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterCurrentSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const getPartialProps = useCharacterSpriteInfos(characterId);
    const { spriteRef, config } = useSpriteGeoUpdate(characterId);

    const partialProps = getPartialProps(config);

    if (!partialProps) {
        return null;
    }

    return <>
        <AnimatedComplexSpriteReact
            ref={spriteRef as any}
            {...partialProps}
        />
    </>;
};
