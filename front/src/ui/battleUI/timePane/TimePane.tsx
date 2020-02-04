import React from 'react';
import { TimeGauge } from './timeGauge/TimeGauge';
import css from './timePane.module.css';
import { TimeOverlay } from './timeOverlay/TimeOverlay';
import { TimeText } from './timeText/TimeText';

export const TimePane: React.FC = () => {

    return <div className={css.root}>

        <div className={css.main_content}>
            <TimeGauge />

            <TimeOverlay />
        </div>

        <TimeText/>

    </div>;
};
