import { ArrayUtils, Position } from '@timeflies/common';
import { getSpellEffectFromSpellRole, SpellEffect, SpellEffectFnParams } from '@timeflies/spell-effects';
import React from 'react';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useFutureEntities } from '../../hooks/use-entities';
import { useRangeAreaContext } from '../../range-area/view/range-area-context';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useTileHoverContext } from '../../tile-interactive/view/tile-hover-context';

export type ComputeSpellEffect = {
    targetPosition: Position;
    spellEffect: SpellEffect;
    spellEffectParams: SpellEffectFnParams;
};

export const useComputeSpellEffect = () => {
    const tiledMap = useTiledMapAssets()?.schema;
    const { rangeArea } = useRangeAreaContext();
    const targetPosition = useTileHoverContext();

    const spell = useBattleSelector(battle => battle.selectedSpellId
        ? battle.staticSpells[ battle.selectedSpellId ]
        : null);

    const staticCharacters = useBattleSelector(battle => battle.staticCharacters);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);

    const futureState = useFutureEntities(state => state);

    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const lastSpellActionEndTime = useBattleSelector(battle => {
        const startTime = ArrayUtils.last(battle.spellActionEffectList);
        return startTime
            ? startTime + battle.spellActionEffects[ startTime ].spellAction.duration
            : null;
    });

    return React.useCallback(async (): Promise<ComputeSpellEffect | null> => {
        if (!tiledMap || !spell || !targetPosition) {
            return null;
        }

        const launchTime = lastSpellActionEndTime
            ? Math.max(lastSpellActionEndTime, Date.now())
            : Date.now();

        const spellEffectParams: SpellEffectFnParams = {
            partialSpellAction: {
                spellId: spell.spellId,
                launchTime,
                targetPos: targetPosition
            },
            context: {
                state: futureState,
                staticState: {
                    characters: staticCharacters,
                    spells: staticSpells
                },
                currentTurn: {
                    playerId: staticCharacters[ spell.characterId ].playerId,
                    characterId: spell.characterId,
                    startTime: turnStartTime
                },
                map: {
                    tiledMap,
                    rangeArea
                }
            }
        };

        const spellEffect = await getSpellEffectFromSpellRole(spell.spellRole, spellEffectParams);

        const turnEndTime = turnStartTime + futureState.characters.actionTime[ spell.characterId ];
        const effectEndTime = launchTime + spellEffect.duration;

        if (spellEffect.actionArea.length === 0
            || effectEndTime > turnEndTime) {
            return null;
        }

        return {
            targetPosition,
            spellEffect,
            spellEffectParams
        };
    }, [
        futureState, rangeArea, spell, lastSpellActionEndTime,
        staticCharacters, staticSpells, targetPosition, tiledMap, turnStartTime
    ]);
};
