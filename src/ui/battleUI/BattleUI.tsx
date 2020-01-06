import React from "react";
import { SpellPane } from "./spellPane/SpellPane";
import css from './battleUI.module.css';
import { TimePane } from "./timePane/TimePane";

export interface BattleUIProps {

}

export const BattleUI: React.FC<BattleUIProps> = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <SpellPane />

            <TimePane />
        </div>

    </div>;
};
