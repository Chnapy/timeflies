import React from "react";
import { SpellPanel } from "./spell-panel/spell-panel";
import { TimePanel } from "./time-panel/time-panel";
import { CharacterListPanel } from "./character-list-panel/character-list-panel";
import css from './battleUI.module.css';


export const BattleUI: React.FC = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <CharacterListPanel />

            <SpellPanel />

            <TimePanel />
        </div>

    </div>;
};
