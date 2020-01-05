import React from 'react';
import { connect } from "react-redux";
import { UIState } from "../../UIState";
import { SpellBtn } from './SpellBtn';
import css from './spellPane.module.css';
import { SpellType } from '../../../phaser/entities/Spell';

interface SpellPaneInnerProps {
    mainSpellIds: number[];
    sideSpellIds: number[];
}

const sideSpellTypes: SpellType[] = ['move', 'orientate'];

export const SpellPane = connect<SpellPaneInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { currentCharacter } } }) => ({
        mainSpellIds: currentCharacter?.spells
            .filter(s => !sideSpellTypes.includes(s.type))
            .map(s => s.id) || [],
        sideSpellIds: currentCharacter?.spells
            .filter(s => sideSpellTypes.includes(s.type))
            .map(s => s.id) || []
    })
)(({ mainSpellIds, sideSpellIds }: SpellPaneInnerProps) => {

    return <div className={css.root}>

        <div className={css.sideSpells}>
            {sideSpellIds.map(id => <SpellBtn key={id} spellId={id} />)}
        </div>

        <div className={css.mainSpells}>
            {mainSpellIds.map(id => <SpellBtn key={id} spellId={id} />)}
        </div>

    </div>;
});
