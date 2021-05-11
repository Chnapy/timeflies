import { CharacterId, CharacterUtils } from '@timeflies/common';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useCurrentEntities } from '../../../hooks/use-entities';

export const useCharacterDeathFade = (characterId: CharacterId) => {
    const [alpha, setAlpha] = React.useState(1);

    const tickerFadeIn = React.useRef<PIXI.Ticker | null>(null);

    const isAlive = useCurrentEntities(entities => CharacterUtils.isAlive(entities.characters.health[ characterId ]));

    React.useEffect(() => {
        const destroyTicker = () => {
            if(tickerFadeIn.current) {
                tickerFadeIn.current.destroy();
                tickerFadeIn.current = null;
            }
        };
        destroyTicker();
        
        if (isAlive) {
            setAlpha(1);
        } else {
            const startTime = Date.now();
            const duration = 1500;

            tickerFadeIn.current = new PIXI.Ticker();
            tickerFadeIn.current.add(() => {
                const elapsedTime = Date.now() - startTime;
                const newAlpha = Math.max(1 - elapsedTime / duration, 0);

                setAlpha(newAlpha);

                if (newAlpha === 0) {
                    destroyTicker();
                }
            });
            tickerFadeIn.current.start();
        }

    }, [ isAlive ]);

    return alpha;
};
