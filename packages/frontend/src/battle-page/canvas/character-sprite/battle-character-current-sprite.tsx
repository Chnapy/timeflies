import { AnimatedComplexSprite, AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCharacterSpriteInfos } from './hooks/use-character-sprite-infos';
import { useSpriteConfigUpdate } from './hooks/use-sprite-config-update';
import { useSpritePositionUpdate } from './hooks/use-sprite-position-update';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterCurrentSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const spriteRef = React.useRef<AnimatedComplexSprite>(null);

    const getPartialProps = useCharacterSpriteInfos(characterId);
    const config = useSpriteConfigUpdate(characterId);
    const { x, y } = useSpritePositionUpdate(characterId);

    const partialProps = getPartialProps(config);

    if (!partialProps) {
        return null;
    }

    return <>
        <AnimatedComplexSpriteReact
            ref={spriteRef as any}
            position={[ x, y ]}
            {...partialProps}
        />
    </>;
};
