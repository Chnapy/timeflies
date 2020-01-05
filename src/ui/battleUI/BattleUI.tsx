import React from "react";
import { SpellPane } from "./spellPane/SpellPane";
import css from './battleUI.module.css';

export interface BattleUIProps {

}

export const BattleUI: React.FC<BattleUIProps> = () => {
    return <div className={css.root}>

        <div className={css.row_bottom}>
            <SpellPane />
        </div>

    </div>;
};
