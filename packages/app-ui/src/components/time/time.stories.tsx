import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { TurnIcon } from './turn-icon';

export default {
  title: 'UI/Time',
} as Meta;

export const Default: React.FC = () => {
  const now = Date.now();

  return (
    <Box p={2}>
      <Card style={{ width: 300 }}>
        <CardContent>

          <TurnIcon duration={13000} startTime={now} />

        </CardContent>
      </Card>
    </Box>
  );
};
