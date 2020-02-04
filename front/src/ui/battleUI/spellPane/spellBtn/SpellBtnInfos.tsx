import React from "react";
import css from './spellBtnInfos.module.css';

export interface SpellBtnInfosProps {
    time: number;
    attack: number;
}

export const SpellBtnInfos: React.FC<SpellBtnInfosProps> = ({ time, attack }) => {

    return <div className={css.root}>
        <div className={css.timeLine}>{(time / 1000).toFixed(1)}</div>
        {attack > 0 && <div className={css.attackLine}>{attack}</div>}
    </div>;
};
