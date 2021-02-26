import { Position } from '@timeflies/common';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const emptyArray: Position[] = [];

export const useCurrentActionArea = (): Position[] => useBattleSelector(({ currentTime, spellActionEffectList, spellActionEffects }) => {
    const startTimeList = spellActionEffectList.filter(startTime => startTime > currentTime);
    const area = startTimeList.flatMap(startTime => spellActionEffects[ startTime ].spellEffect.actionArea);
    if (area.length === 0) {
        return emptyArray;
    }
    return area;
});
