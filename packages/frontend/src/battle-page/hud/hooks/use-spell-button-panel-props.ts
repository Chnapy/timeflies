import { SpellId } from '@timeflies/common';
import { SpellButtonPanelProps } from '@timeflies/spell-button-panel';
import { useSelectedSpellContext, useSelectedSpellDispatchContext } from '../../spell-select/view/selected-spell-context';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const emptyArray: SpellId[] = [];

export const useSpellButtonPanelProps = (): SpellButtonPanelProps | null => {
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const spellList = useBattleSelector(battle => playingCharacterId ? battle.spellLists[ playingCharacterId ] : emptyArray);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellsDuration = useBattleSelector(battle => battle.currentSpells.duration);
    const defaultSpellId = useBattleSelector(battle => playingCharacterId
        ? battle.staticCharacters[ playingCharacterId ].defaultSpellId
        : null);
    const isMyCharacter = useBattleSelector(battle => playingCharacterId
        ? battle.staticCharacters[ playingCharacterId ].playerId === battle.myPlayerId
        : false);

    const { selectedSpellId } = useSelectedSpellContext();
    const dispatchSelectedSpellId = useSelectedSpellDispatchContext();

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
                dispatchSelectedSpellId({ selectedSpellId: spellId });
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
