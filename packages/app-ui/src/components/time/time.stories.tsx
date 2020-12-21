import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { TimeGauge } from './time-gauge/time-gauge';
import { TimeCounter } from './time-counter';
import { TurnIcon } from './turn-icon';

export default {
  title: 'UI/Time',
} as Meta;

const TimeGaugeSpaced: typeof TimeGauge = props => (
  <Box mb={0.5}>
    <TimeGauge {...props} />
  </Box>
);

export const Default: React.FC = () => {
  const now = Date.now();

  return (
    <Box p={2}>
      <Card style={{ width: 300 }}>
        <CardContent>

          <TimeGaugeSpaced duration={13000} />
          <TimeGaugeSpaced duration={12000} />
          <TimeGaugeSpaced duration={11000} />
          <TimeGaugeSpaced duration={10000} />
          <TimeGaugeSpaced duration={9000} />
          <TimeGaugeSpaced duration={3000} />
          <TimeGaugeSpaced duration={30000} />
          <TimeGaugeSpaced duration={0} />
          <TimeGaugeSpaced duration={-13000} />
          <TimeGaugeSpaced duration={27000} />

          <TimeGaugeSpaced duration={13000} startTime={now} />

          <TurnIcon duration={13000} startTime={now} />
          <TimeCounter duration={13000} startTime={now} />

        </CardContent>
      </Card>
    </Box>
  );
};
