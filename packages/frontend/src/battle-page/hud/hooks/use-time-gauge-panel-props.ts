import { getSpellCategory } from '@timeflies/common';
import { TimeGaugePanelProps } from '@timeflies/time-gauge-panel';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useTimeGaugePanelProps = (): TimeGaugePanelProps => {
    const startTime = useBattleSelector(battle => battle.turnStartTime);
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const duration = useBattleSelector(battle => playingCharacterId ? battle.currentCharacters.actionTime[playingCharacterId] : 0);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellActionList = useBattleSelector(battle => battle.spellActionList);
    const spellActions = useBattleSelector(battle => battle.spellActions);

    const spellDurationList = spellActionList.map((startTime): TimeGaugePanelProps['spellDurationList'][number] => {
        const { spellId, duration } = spellActions[startTime];

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
