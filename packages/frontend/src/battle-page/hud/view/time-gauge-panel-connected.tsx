import { TimeGaugePanel } from '@timeflies/time-gauge-panel';
import React from 'react';
import { useTimeGaugePanelProps } from '../hooks/use-time-gauge-panel-props';

export const TimeGaugePanelConnected: React.FC = () => {
    const props = useTimeGaugePanelProps();

    return <TimeGaugePanel {...props} />;
};
