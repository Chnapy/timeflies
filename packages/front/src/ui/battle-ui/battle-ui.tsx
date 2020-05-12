import React from "react";
import { SpellPane } from "./spellPane/SpellPane";
import { TimePane } from "./timePane/TimePane";
import { CharactersPane } from "./charactersPane/CharactersPane";
import css from './battleUI.module.css';


export const BattleUI: React.FC = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <CharactersPane />

            <SpellPane />

            <TimePane />
        </div>

    </div>;
};
