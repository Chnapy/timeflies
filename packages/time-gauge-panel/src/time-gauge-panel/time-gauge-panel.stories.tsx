import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { TimeGaugePanel } from './time-gauge-panel';

export default {
    title: 'Time gauge panel',
} as Meta;

const TimeGaugePanelSpaced: typeof TimeGaugePanel = props => (
    <Box mb={0.5}>
        <TimeGaugePanel {...props} />
    </Box>
);

export const Default: React.FC = () => {
    const now = Date.now();
    const future = now + 30000;

    return (
        <Box width={300} p={2}>

            <TimeGaugePanelSpaced
                duration={13000}
                startTime={now}
                spellDurationList={[
                    {
                        spellCategory: 'offensive',
                        startTime: now,
                        duration: 2000
                    },
                    {
                        spellCategory: 'placement',
                        startTime: now + 2000,
                        duration: 1500
                    },
                    {
                        spellCategory: 'placement',
                        startTime: now + 4500,
                        duration: 4000
                    },
                    {
                        spellCategory: 'support',
                        startTime: now + 10000,
                        duration: 3000
                    }
                ]}
            />

            <TimeGaugePanelSpaced
                duration={13000}
                startTime={future}
                spellDurationList={[
                    {
                        spellCategory: 'offensive',
                        startTime: future,
                        duration: 2000
                    },
                    {
                        spellCategory: 'placement',
                        startTime: future + 2000,
                        duration: 1500
                    },
                    {
                        spellCategory: 'placement',
                        startTime: future + 4500,
                        duration: 4000
                    },
                    {
                        spellCategory: 'support',
                        startTime: future + 10000,
                        duration: 3000
                    }
                ]}
            />

        </Box>
    );
};
