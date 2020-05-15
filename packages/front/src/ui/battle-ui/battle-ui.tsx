import React from "react";
import { SpellPanel } from "./spell-panel/spell-panel";
import { TimePanel } from "./time-panel/time-panel";
import { CharactersPane } from "./charactersPane/CharactersPane";
import css from './battleUI.module.css';


export const BattleUI: React.FC = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <CharactersPane />

            <SpellPanel />

            <TimePanel />
        </div>

    </div>;
};
