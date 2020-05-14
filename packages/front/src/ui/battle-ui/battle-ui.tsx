import React from "react";
import { SpellPanel } from "./spellPane/spell-panel";
import { TimePane } from "./timePane/TimePane";
import { CharactersPane } from "./charactersPane/CharactersPane";
import css from './battleUI.module.css';


export const BattleUI: React.FC = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <CharactersPane />

            <SpellPanel />

            <TimePane />
        </div>

    </div>;
};
