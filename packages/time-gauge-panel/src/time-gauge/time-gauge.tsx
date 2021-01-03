import { TimeProps } from '@timeflies/app-ui';
import React from 'react';
import { TimeGaugeRaw, TimeGaugeRawStyleProps } from './time-gauge-raw';
import { TimeGaugeRawCadenced } from './time-gauge-raw-cadenced';

const height = 4;
const tockSpacing = 2;
const tockMaxWidth = 12;
const tickSpacing = 1;
const tickMaxWidth = Math.floor(tockMaxWidth * (3 / 5));

const styleProps: TimeGaugeRawStyleProps = {
    height,
    tockMaxWidth,
    tockSpacing,
    tickMaxWidth,
    tickSpacing
};

export const TimeGauge: React.FC<TimeProps> = ({ startTime, duration }) => (
    startTime
        ? <TimeGaugeRawCadenced {...styleProps} startTime={startTime} duration={duration} />
        : <TimeGaugeRaw {...styleProps} duration={duration} />
);
