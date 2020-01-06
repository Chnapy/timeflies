import React from 'react';
import { TimeGauge } from './timeGauge/TimeGauge';
import css from './timePane.module.css';

export const TimePane: React.FC = () => {

    return <div className={css.root}>

        <div className={css.main_content}>
            <TimeGauge />
        </div>

    </div>;
};
