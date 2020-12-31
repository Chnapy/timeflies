import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { HealthGauge, HealthGaugeProps } from './health-gauge';

export default {
    title: 'UI/Health',
} as Meta;

const HealthGaugeSpaced: React.FC<Omit<HealthGaugeProps, 'direction'>> = props => (
    <Box mb={0.5} display='flex'>
        <HealthGauge direction='horizontal' {...props} />
        <Box width={50} height={50} ml={1}>
            <HealthGauge direction='vertical' {...props} />
        </Box>
        <Box width={50} height={20} ml={1}>
            <HealthGauge direction='vertical' {...props} />
        </Box>
    </Box>
);

export const Default: React.FC = () => {

    return (
        <Box p={2}>
            <Card style={{ width: 300 }}>
                <CardContent>

                    <HealthGaugeSpaced health={100} />
                    <HealthGaugeSpaced health={75} />
                    <HealthGaugeSpaced health={50} />
                    <HealthGaugeSpaced health={25} />
                    <HealthGaugeSpaced health={0} />
                    <HealthGaugeSpaced health={86} />
                    <HealthGaugeSpaced health={26} />
                    <HealthGaugeSpaced health={1} />
                    <HealthGaugeSpaced health={99} />

                </CardContent>
            </Card>
        </Box>
    );
};
