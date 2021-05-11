import { ArrayUtils, SerializableState } from '@timeflies/common';
import { BattleState } from '../store/battle-state';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const currentEntitiesSelector = ({ currentTime, serializableStates }: BattleState) => serializableStates[ currentTime ];
export const useCurrentEntities = <R>(
    selector: (state: SerializableState) => R
) => useBattleSelector(battle => selector(currentEntitiesSelector(battle)));

export const futureEntitiesSelector = ({ serializableStates, serializableStateList }: BattleState) => serializableStates[ ArrayUtils.last(serializableStateList)! ];
export const useFutureEntities = <R>(
    selector: (state: SerializableState) => R
) => useBattleSelector(battle => selector(futureEntitiesSelector(battle)));
