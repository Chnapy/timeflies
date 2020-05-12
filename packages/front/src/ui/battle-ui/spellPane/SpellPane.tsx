import { SpellType } from '@timeflies/shared'
import React from 'react';
import { connect } from "react-redux";
import { GameState } from "../../../game-state";
import { SpellButton } from './spellBtn/spell-button';
import css from './spellPane.module.css';

interface SpellPaneInnerProps {
    mainSpellIds: string[];
    sideSpellIds: string[];
}

const sideSpellTypes: SpellType[] = [ 'move', 'orientate' ];

export const SpellPane = connect<SpellPaneInnerProps, {}, {}, GameState>(
    ({ battle }) => ({

        mainSpellIds: battle!.cycle.globalTurn?.currentTurn?.character.spells
            .filter(s => !sideSpellTypes.includes(s.staticData.type))
            .map(s => s.id) || [],

        sideSpellIds: battle!.cycle.globalTurn?.currentTurn?.character.spells
            .filter(s => sideSpellTypes.includes(s.staticData.type))
            .map(s => s.id) || []
    })
)(({ mainSpellIds, sideSpellIds }: SpellPaneInnerProps) => {

    return <div className={css.root}>

        <div className={css.sideSpells}>
            {sideSpellIds.map(id => <SpellButton key={id} spellId={id} />)}
        </div>

        <div className={css.mainSpells}>
            {mainSpellIds.map(id => <SpellButton key={id} spellId={id} />)}
        </div>

    </div>;
});
