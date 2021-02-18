import { SpellId } from '@timeflies/common';
import { SpellButtonPanelProps } from '@timeflies/spell-button-panel';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const emptyArray: SpellId[] = [];

export const useSpellButtonPanelProps = (): SpellButtonPanelProps | null => {
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const spellList = useBattleSelector(battle => playingCharacterId ? battle.spellLists[ playingCharacterId ] : emptyArray);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellsDuration = useBattleSelector(battle => battle.currentSpells.duration);
    const selectedSpellId = useBattleSelector(battle => battle.selectedSpellId);
    const defaultSpellRole = useBattleSelector(battle => playingCharacterId
        ? battle.staticCharacters[ playingCharacterId ].defaultSpellRole
        : null);

    if(spellList.length === 0 || !defaultSpellRole) {
        return null;
    }

    const spellRoleList = spellList.map(spellId => staticSpells[ spellId ].spellRole);

    const spellsProps = spellList.reduce((acc, spellId) => {
        const { spellRole } = staticSpells[ spellId ];

        acc[ spellRole ] = {
            spellRole,
            selected: spellId === selectedSpellId,
            duration: spellsDuration[ spellId ],
            disabled: false,    // TODO
            onClick: () => { }   // TODO
        };

        return acc;
    }, {} as SpellButtonPanelProps[ 'spellsProps' ]);

    return {
        spellsProps,
        spellRoleList,
        defaultSpellRole
    };
};
