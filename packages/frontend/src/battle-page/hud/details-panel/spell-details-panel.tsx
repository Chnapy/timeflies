import { SpellId, SpellVariableName, SpellVariables } from '@timeflies/common';
import React from 'react';
import { SpellDetailsPane } from '../../../room-page/room-character-list/details-components';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useDetailsContext, useDetailsLogic } from './details-context';

type InnerSpellDetailsPanelProps = {
    spellId: SpellId;
};

const InnerSpellDetailsPanel: React.FC<InnerSpellDetailsPanelProps> = React.memo(({ spellId }) => {
    const { spellClick } = useDetailsLogic();

    const spellRole = useBattleSelector(state => state.staticSpells[ spellId ].spellRole);

    const spellVariables: {
        [ name in SpellVariableName ]: SpellVariables[ name ];
    } = {
        duration: useBattleSelector(state => state.initialSerializableState.spells.duration[ spellId ]),
        rangeArea: useBattleSelector(state => state.initialSerializableState.spells.rangeArea[ spellId ]),
        actionArea: useBattleSelector(state => state.initialSerializableState.spells.actionArea[ spellId ]),
        lineOfSight: useBattleSelector(state => state.initialSerializableState.spells.lineOfSight[ spellId ]),
        attack: useBattleSelector(state => state.initialSerializableState.spells.attack[ spellId ])
    };

    return <SpellDetailsPane
        spellRole={spellRole}
        spellVariables={spellVariables}
        onClose={() => spellClick(null)}
    />;
});

export const SpellDetailsPanel: React.FC = () => {
    const spellId = useDetailsContext().selectedSpellId;

    return spellId
        ? <InnerSpellDetailsPanel spellId={spellId} />
        : null;
};