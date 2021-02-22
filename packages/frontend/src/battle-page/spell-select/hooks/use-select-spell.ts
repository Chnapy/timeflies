import { SpellId } from '@timeflies/common';
import { useIsMyCharacterPlaying } from '../../hooks/use-is-my-character-playing';
import { useSelectedSpellContext, useSelectedSpellDispatchContext } from '../view/selected-spell-context';

export const useSelectSpell = () => {
    const isMyCharacterPlaying = useIsMyCharacterPlaying();
    const { selectedSpellId } = useSelectedSpellContext();
    const selectedSpellDispatch = useSelectedSpellDispatchContext();
    
    return (spellId: SpellId | null) => {
        if (
            !isMyCharacterPlaying
            || selectedSpellId === spellId
        ) {
            return;
        }

        selectedSpellDispatch({
            selectedSpellId: spellId
        });
    };
};
