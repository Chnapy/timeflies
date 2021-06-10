import { SpellId } from '@timeflies/common';
import { SpellButtonSimple } from '@timeflies/spell-button-panel';
import React from 'react';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useDetailsLogic } from './details-context';

type SpellButtonSimpleConnectedProps = {
    spellId: SpellId;
};

export const SpellButtonSimpleConnected: React.FC<SpellButtonSimpleConnectedProps> = ({ spellId }) => {
    const { spellHover, spellClick } = useDetailsLogic();

    const spellRole = useBattleSelector(state => state.staticSpells[ spellId ].spellRole);

    return (
        <SpellButtonSimple
            imageSize={28}
            padding={2}
            spellRole={spellRole}
            onClick={() => spellClick(spellId)}
            onMouseEnter={() => spellHover(spellId)}
            onMouseLeave={() => spellHover(null)}
            selected={false}
            disabled={false}
        />
    );
};
