import { SpellId } from '@timeflies/common';
import { useDispatch } from 'react-redux';
import { SpellSelectAction } from '../store/spell-select-actions';

export const useSelectSpell = () => {
    const dispatch = useDispatch();

    return (spellId: SpellId | null) => {
        dispatch(SpellSelectAction(spellId));
    };
};
