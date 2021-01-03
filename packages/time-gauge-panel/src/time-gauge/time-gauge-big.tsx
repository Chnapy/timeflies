import { TimeFullProps } from '@timeflies/app-ui';
import React from 'react';
import { TimeGaugeRawStyleProps } from './time-gauge-raw';
import { TimeGaugeRawCadenced } from './time-gauge-raw-cadenced';

const height = 8;
const tockSpacing = 2;
const tockMaxWidth = 52;
const tickSpacing = 2;
const tickMaxWidth = 10;

const styleProps: TimeGaugeRawStyleProps = {
    height,
    tockMaxWidth,
    tockSpacing,
    tickMaxWidth,
    tickSpacing
};

export const TimeGaugeBig: React.FC<TimeFullProps> = ({ startTime, duration }) => {
    return <TimeGaugeRawCadenced {...styleProps} startTime={startTime} duration={duration} />;
};
