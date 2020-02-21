import { SpellType } from '@timeflies/shared'
import React from 'react';
import { connect } from "react-redux";
import { UIState } from "../../UIState";
import { SpellBtn } from './spellBtn/SpellBtn';
import css from './spellPane.module.css';

interface SpellPaneInnerProps {
    mainSpellIds: string[];
    sideSpellIds: string[];
}

const sideSpellTypes: SpellType[] = [ 'move', 'orientate' ];

export const SpellPane = connect<SpellPaneInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { globalTurn } } }) => ({
        
        mainSpellIds: globalTurn?.currentTurn?.character.spells
            .filter(s => !sideSpellTypes.includes(s.staticData.type))
            .map(s => s.id) || [],

        sideSpellIds: globalTurn?.currentTurn?.character.spells
            .filter(s => sideSpellTypes.includes(s.staticData.type))
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
