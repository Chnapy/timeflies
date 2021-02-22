import { useSocketListeners } from '@timeflies/socket-client';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { useSelectSpell } from '../../spell-select/hooks/use-select-spell';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattlePrepareTurnStartAction } from '../store/cycle-actions';

export const useCycleListener = () => {
    const addSocketListeners = useSocketListeners();
    const selectSpell = useSelectSpell();
    const staticCharacters = useBattleSelector(battle => battle.staticCharacters);
    const dispatch = useDispatch();

    useAsyncEffect(() => {
        return addSocketListeners({
            [ BattleTurnStartMessage.action ]: ({ payload }: ReturnType<typeof BattleTurnStartMessage>) => {
                dispatch(BattlePrepareTurnStartAction(payload));
                selectSpell(staticCharacters[ payload.characterId ].defaultSpellId);
            }
        });
    },
        removeListeners => removeListeners && removeListeners(),
        []);
};
