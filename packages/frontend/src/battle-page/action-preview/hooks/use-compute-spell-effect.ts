import { ArrayUtils } from '@timeflies/common';
import { getSpellEffectFromSpellRole, SpellEffect, SpellEffectFnParams } from '@timeflies/spell-effects';
import { useFutureEntities } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { ActionPreviewContextValueGeo } from '../view/action-preview-context';

export type ComputeSpellEffect = {
    spellEffect: SpellEffect;
    spellEffectParams: SpellEffectFnParams;
};

export const useComputeSpellEffect = ({ targetPosition, actionArea }: ActionPreviewContextValueGeo) => {
    const spellId = useBattleSelector(battle => battle.selectedSpellId);
    const spell = useBattleSelector(battle => spellId
        ? battle.staticSpells[ spellId ]
        : null);

    const staticCharacters = useBattleSelector(battle => battle.staticCharacters);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);

    const futureState = useFutureEntities(state => state);

    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const spellActionList = useBattleSelector(battle => battle.spellActionList);
    const spellActions = useBattleSelector(battle => battle.spellActions);

    return (): ComputeSpellEffect | null => {
        if (!spellId || !spell || !targetPosition) {
            return null;
        }

        const getLastSpellActionEndTime = () => {
            const startTime = ArrayUtils.last(spellActionList)!;
            return startTime + spellActions[ startTime ].duration;
        };

        const launchTime = spellActionList.length > 0
            ? Math.max(getLastSpellActionEndTime(), Date.now())
            : Date.now();

        const spellEffectParams: SpellEffectFnParams = {
            spellAction: {
                spellId,
                launchTime,
                duration: futureState.spells.duration[ spellId ],
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
                    actionArea
                }
            }
        };

        return {
            spellEffect: getSpellEffectFromSpellRole(spell.spellRole, spellEffectParams),
            spellEffectParams
        };
    };
};
