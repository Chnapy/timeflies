import { getSpellCategory } from '@timeflies/common';
import { TimeGaugePanelProps } from '@timeflies/time-gauge-panel';
import { currentEntitiesSelector } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useTimeGaugePanelProps = (): TimeGaugePanelProps => {
    const startTime = useBattleSelector(battle => battle.turnStartTime);
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const duration = useBattleSelector(battle => playingCharacterId ? currentEntitiesSelector(battle).characters.actionTime[playingCharacterId] : 0);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellActionEffectList = useBattleSelector(battle => battle.spellActionEffectList);
    const spellActionEffects = useBattleSelector(battle => battle.spellActionEffects);

    const spellDurationList = spellActionEffectList.map((startTime): TimeGaugePanelProps['spellDurationList'][number] => {
        const { spellId, duration } = spellActionEffects[startTime].spellAction;

        return {
            startTime,
            duration,
            spellCategory: getSpellCategory(staticSpells[spellId].spellRole)
        };
    });

    return {
        startTime,
        duration,
        spellDurationList
    };
};
