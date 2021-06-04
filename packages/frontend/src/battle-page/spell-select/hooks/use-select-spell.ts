import { SpellId } from '@timeflies/common';
import { useDispatch } from 'react-redux';
import { useIsMyCharacterPlaying } from '../../hooks/use-is-my-character-playing';
import { SpellSelectAction } from '../store/spell-select-actions';

export const useSelectSpell = () => {
    const dispatch = useDispatch();
    const isMyCharacterPlaying = useIsMyCharacterPlaying();

    return (spellId: SpellId | null) => {
        if (isMyCharacterPlaying) {
            dispatch(SpellSelectAction(spellId));
        }
    };
};
