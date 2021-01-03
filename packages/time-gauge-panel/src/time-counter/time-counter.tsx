import { getTimeSimplifiedDurationFn, TimeFullProps, TimeProps, useCadencedTime, VariableValue, VariableValueProps } from '@timeflies/app-ui';
import React from 'react';

type ExtraProps = Pick<VariableValueProps, 'colored'>;

export const TimeCounter: React.FC<TimeProps & ExtraProps> = ({ startTime, duration, colored }) => (
    startTime
        ? <InnerTimeCounter startTime={startTime} duration={duration} colored={colored} />
        : <VariableValue variableName='actionTime' value={duration} colored={colored} />
);

const InnerTimeCounter: React.FC<TimeFullProps & ExtraProps> = ({ startTime, duration, colored }) => {
    const timeSimplifiedDurationFn = React.useMemo(
        () => getTimeSimplifiedDurationFn({ startTime, duration }, 2),
        [ startTime, duration ]
    );

    const value = useCadencedTime(timeSimplifiedDurationFn);

    return <VariableValue variableName='actionTime' value={value} colored={colored} />
};
