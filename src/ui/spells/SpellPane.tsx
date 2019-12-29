import React from 'react';
import { connect } from 'react-redux';
import { UIState } from '../UIState';
import { Spell } from '../../phaser/entities/Spell';
import { SpellBtn } from './SpellBtn';
import { BattleState } from '../../phaser/stateManager/BattleStateManager';

export interface SpellPaneProps {
    spells: Spell[];
    disabled: boolean;
    prepareSpell?: Spell;
}

const authorizedState: BattleState[] = ['idle', 'spellPrepare'];

export const SpellPane = connect<SpellPaneProps, {}, {}, UIState>(
    ({ currentCharacter, gameState }) => ({
        spells: currentCharacter?.spells || [],
        prepareSpell: gameState && gameState.state === 'spellPrepare' ? gameState.data.spell : undefined,
        disabled: gameState && !authorizedState.includes(gameState.state)
    })
)(({ spells, prepareSpell, disabled }: SpellPaneProps): React.ReactElement => {

    return <div>
        {spells.map(s => <SpellBtn
            key={s.name}
            spell={s}
            isActive={!!prepareSpell && prepareSpell.name === s.name}
            disabled={disabled}
        />)}
    </div>;
});
