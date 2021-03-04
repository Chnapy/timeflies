import { AnimatedComplexSprite } from '@timeflies/animated-complex-sprite';
import { CharacterId, getOrientationFromTo, getSpellCategory, getTimeDiffFromNow, SpellRole } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useTiledMapAssets } from '../../../assets-loader/hooks/use-tiled-map-assets';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';

const isMoveState = (spellRole: SpellRole | null) => spellRole === 'move';
const isAttackState = (spellRole: SpellRole | null) => spellRole && getSpellCategory(spellRole) === 'offensive';

export const useSpriteGeoUpdate = (characterId: CharacterId) => {
    const tiledMapAssets = useTiledMapAssets();

    const { characterRole } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
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

    const isTargeted = spellActionEffect && !isActing && spellActionEffect.spellEffect.actionArea.some(p => p.id === position.id);

    const finalOrientation = useCurrentEntities(({ characters }) => {
        if(isAttackState(spellRole)) {
            const nextOrientation = (spellActionEffect?.spellEffect.characters ?? {})[characterId]?.orientation;
            if(nextOrientation) {
                return nextOrientation;
            }
        }

        return characters.orientation[ characterId ];
    });

    const [ tempOrientation, setTempOrientation ] = React.useState(finalOrientation);

    const spriteRef = React.useRef<AnimatedComplexSprite>(null);
    const tickerRef = React.useRef<PIXI.Ticker | null>(null);
    const destroyTicker = () => {
        if (tickerRef.current) {
            tickerRef.current.destroy();
            tickerRef.current = null;
        }
    };

    const tilesize = tiledMapAssets ? tiledMapAssets.schema.tileheight : 0;

    React.useEffect(() => {
        destroyTicker();

        const sprite = spriteRef.current;
        if (!sprite) {
            return;
        }

        const computePosition = (x: number, y: number) => new PIXI.Point(
            x * tilesize + tilesize / 2,
            y * tilesize + tilesize / 3
        );

        const resetPosition = () => {
            sprite.position = computePosition(position.x, position.y);
        };
        resetPosition();

        if (!spellActionEffect || !isMoveState(spellRole)) {
            return;
        }

        const { spellAction, spellEffect } = spellActionEffect;

        const stepDuration = spellAction.duration / spellEffect.actionArea.length;

        const fullActionArea = [ position, ...spellEffect.actionArea ];

        const updatePosition = () => {
            const elapsedTime = getTimeDiffFromNow(spellAction.launchTime);

            const index = Math.floor(elapsedTime / stepDuration);
            const stepElapsedTime = elapsedTime % stepDuration;
            const stepElapsedPercent = stepElapsedTime / stepDuration;

            const [ prevPos, nextPos ] = [ fullActionArea[ index ], fullActionArea[ index + 1 ] ];

            if (nextPos) {
                sprite.position = computePosition(
                    prevPos.x + (nextPos.x - prevPos.x) * stepElapsedPercent,
                    prevPos.y + (nextPos.y - prevPos.y) * stepElapsedPercent
                );

                setTempOrientation(getOrientationFromTo(prevPos, nextPos));
            }
        };

        updatePosition();

        tickerRef.current = new PIXI.Ticker();
        tickerRef.current.add(updatePosition);
        tickerRef.current.start();

        return destroyTicker;
    }, [ spellActionEffect, spellRole, position, isActing, tilesize ]);

    const moveState = isMoveState(spellRole);

    const getState = (): SpritesheetsUtils.CharacterSpriteState => {
        if(isTargeted) {
            return 'hit';
        }

        if (moveState) {
            return 'walk';
        }

        if (isAttackState(spellRole)) {
            return 'attack';
        }

        return 'idle';
    };

    const config: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation: moveState ? tempOrientation : finalOrientation,
        state: getState()
    };

    return {
        spriteRef,
        config
    };
};
