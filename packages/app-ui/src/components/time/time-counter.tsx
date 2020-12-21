import React from 'react';
import { VariableValue } from '../variable';
import { useCadencedTime } from './time-hooks';
import { TimeFullProps, TimeProps } from './time-props';
import { getTimeSimplifiedDurationFn } from './time-utils';


export const TimeCounter: React.FC<TimeProps> = ({ startTime, duration }) => (
    startTime
        ? <InnerTimeCounter startTime={startTime} duration={duration} />
        : <VariableValue variableName='actionTime' value={duration} />
);

const InnerTimeCounter: React.FC<TimeFullProps> = props => {
    const value = useCadencedTime(getTimeSimplifiedDurationFn(props, 2));

    return <VariableValue variableName='actionTime' value={value} />
};
