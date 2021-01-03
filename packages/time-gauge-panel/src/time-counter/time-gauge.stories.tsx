import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { TimeCounter } from './time-counter';

export default {
  title: 'Time counter',
} as Meta;

const TimeCounterSpaced: typeof TimeCounter = props => (
  <Box mb={0.5}>
    <TimeCounter {...props} />
  </Box>
);

export const Default: React.FC = () => {
  const now = Date.now();

  return (
    <Box p={2}>
      <Card style={{ width: 300 }}>
        <CardContent>

          <TimeCounterSpaced duration={13000} />
          <TimeCounterSpaced duration={30000} colored />
          <TimeCounterSpaced duration={0} />
          <TimeCounterSpaced duration={-13000} colored />

          <TimeCounterSpaced duration={13000} startTime={now} />
          <TimeCounterSpaced startTime={now} duration={25000} colored />

        </CardContent>
      </Card>
    </Box>
  );
};
