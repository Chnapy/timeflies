import { CharacterId, getTimeDiffFromNow, Position, SpellRole } from '@timeflies/common';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';

export const isMoveState = (spellRole: SpellRole | null) => spellRole === 'move';

const noop = () => {};

export const useSpriteMoveUpdateTicker = (
    characterId: CharacterId,
    onUpdate: (prevPos: Position, nextPos: Position, stepElapsedPercent: number) => void,
    onChange: () => void = noop,
) => {

    const position = useCurrentEntities(({ characters }) => characters.position[ characterId ]);
    const spellActionEffect = useBattleSelector(({ currentTime, spellActionEffectList, spellActionEffects }) => {
        const startTime = spellActionEffectList.find(startTime => startTime > currentTime);
        if (!startTime) {
            return null;
        }

        return spellActionEffects[ startTime ];
    });

    const isActing = useBattleSelector(battle => spellActionEffect
        ? battle.staticSpells[ spellActionEffect.spellAction.spellId ].characterId === characterId
        : false);
    const spellRole = useBattleSelector(battle => spellActionEffect && isActing
        ? battle.staticSpells[ spellActionEffect.spellAction.spellId ].spellRole
        : null);

    const tickerRef = React.useRef<PIXI.Ticker | null>(null);
    const destroyTicker = () => {
        if (tickerRef.current) {
            tickerRef.current.destroy();
            tickerRef.current = null;
        }
    };

    const moveState = isMoveState(spellRole);

    React.useEffect(() => {
        destroyTicker();

        onChange();

        if (!spellActionEffect || !moveState) {
            return;
        }

        const { spellAction, spellEffect } = spellActionEffect;

        const stepDuration = spellAction.duration / spellEffect.actionArea.length;

        const fullActionArea = [ position, ...spellEffect.actionArea ];

        const update = () => {
            const elapsedTime = getTimeDiffFromNow(spellAction.launchTime);

            const index = Math.floor(elapsedTime / stepDuration);
            const stepElapsedTime = elapsedTime % stepDuration;
            const stepElapsedPercent = stepElapsedTime / stepDuration;

            const [ prevPos, nextPos ] = [ fullActionArea[ index ], fullActionArea[ index + 1 ] ];

            if (nextPos) {
                onUpdate(prevPos, nextPos, stepElapsedPercent);
            }
        };

        update();

        tickerRef.current = new PIXI.Ticker();
        tickerRef.current.add(update);
        tickerRef.current.start();

        return destroyTicker;
    }, [ spellActionEffect, moveState, position, onUpdate, onChange ]);
};
