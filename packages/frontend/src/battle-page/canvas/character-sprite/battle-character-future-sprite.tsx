import { AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { CharacterId } from '@timeflies/common';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useCurrentEntities, useFutureEntities } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useCharacterSpriteInfos } from './hooks/use-character-sprite-infos';

type BattleCharacterSprite = {
    characterId: CharacterId;
};

export const BattleCharacterFutureSprite: React.FC<BattleCharacterSprite> = ({ characterId }) => {
    const { characterRole } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const futureOrientation = useFutureEntities(({ characters }) => characters.orientation[ characterId ]);
    const futurePosition = useFutureEntities(({ characters }) => characters.position[ characterId ]);
    const sameAsCurrent = useCurrentEntities(({ characters }) => 
        characters.position[ characterId ].id === futurePosition.id
    );

    const tiledMapAssets = useTiledMapAssets();

    const getPartialProps = useCharacterSpriteInfos(characterId);

    if (!tiledMapAssets || sameAsCurrent) {
        return null;
    }

    const partialProps = getPartialProps({
        role: characterRole,
        orientation: futureOrientation,
        state: 'idle'
    });

    if (!partialProps) {
        return null;
    }

    const { tileheight } = tiledMapAssets.schema;
    const mapPosition = new PIXI.Point(
        futurePosition.x * tileheight + tileheight / 2,
        futurePosition.y * tileheight + tileheight / 3
    );

    return <>
        <AnimatedComplexSpriteReact
            {...partialProps}
            run={false}
            pingPong={false}
            position={mapPosition}
            alpha={0.5}
        />
    </>;
};
