import React from 'react';
import { useCadencedTime } from '../time-hooks';
import { TimeFullProps, TimeProps } from '../time-props';
import { getTimeSimplifiedDurationFn } from '../time-utils';
import { TimeGaugeRaw } from './time-gauge-raw';


export const TimeGauge: React.FC<TimeProps> = ({ startTime, duration }) => (
    startTime
        ? <InnerTimeGauge startTime={startTime} duration={duration} />
        : <TimeGaugeRaw duration={duration} />
);

const InnerTimeGauge: React.FC<TimeFullProps> = props => {
    const value = useCadencedTime(getTimeSimplifiedDurationFn(props, 3));

    return <TimeGaugeRaw duration={value} />;
};
