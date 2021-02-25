import { SpellId } from '@timeflies/common';
import { SpellButtonPanelProps } from '@timeflies/spell-button-panel';
import { useCurrentEntities } from '../../hooks/use-entities';
import { useIsMyCharacterPlaying } from '../../hooks/use-is-my-character-playing';
import { useSelectSpell } from '../../spell-select/hooks/use-select-spell';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const emptyArray: SpellId[] = [];

export const useSpellButtonPanelProps = (): SpellButtonPanelProps | null => {
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const spellList = useBattleSelector(battle => playingCharacterId ? battle.spellLists[ playingCharacterId ] : emptyArray);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellsDuration = useCurrentEntities(({ spells }) => spells.duration);
    const defaultSpellId = useBattleSelector(battle => playingCharacterId
        ? battle.staticCharacters[ playingCharacterId ].defaultSpellId
        : null);
    const isMyCharacter = useIsMyCharacterPlaying();

    const selectedSpellId = useBattleSelector(battle => battle.selectedSpellId);
    const selectSpell = useSelectSpell();

    if (spellList.length === 0 || !defaultSpellId) {
        return null;
    }

    const spellsProps = spellList.reduce((acc, spellId) => {
        const { spellRole } = staticSpells[ spellId ];

        acc[ spellId ] = {
            spellRole,
            selected: spellId === selectedSpellId,
            duration: spellsDuration[ spellId ],
            disabled: !isMyCharacter,
            onClick: () => {
                selectSpell(spellId);
            }
        };

        return acc;
    }, {} as SpellButtonPanelProps[ 'spellsProps' ]);

    return {
        spellsProps,
        spellList,
        defaultSpellId
    };
};
