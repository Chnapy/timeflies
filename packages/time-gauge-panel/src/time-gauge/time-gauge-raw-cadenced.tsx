import { getTimeSimplifiedDurationFn, TimeFullProps, useCadencedTime } from '@timeflies/app-ui';
import React from 'react';
import { TimeGaugeRaw, TimeGaugeRawStyleProps } from './time-gauge-raw';

export const TimeGaugeRawCadenced: React.FC<TimeFullProps & TimeGaugeRawStyleProps> = ({ startTime, duration, ...styleProps }) => {
    const timeSimplifiedDurationFn = React.useMemo(
        () => getTimeSimplifiedDurationFn({ startTime, duration }, 3),
        [ startTime, duration ]
    );

    const value = useCadencedTime(timeSimplifiedDurationFn);

    return <TimeGaugeRaw {...styleProps} duration={value} />;
};
