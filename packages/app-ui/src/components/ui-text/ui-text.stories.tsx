import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { UIText } from './ui-text';

export default {
  title: 'UI/Text',
} as Meta;

export const Default: React.FC = () => {

  return (
    <Box p={2}>

      <UIText variant='h1'>
        h1. timeflies
      </UIText>

      <Card style={{ width: 300 }}>
        <CardContent>

          <UIText variant='h2'>
            h2. Room list
</UIText>

          <UIText variant='h3'>
            h3. players
</UIText>

          <UIText variant='h4'>
            h4. Room list
</UIText>

          <UIText variant='numeric'>
            12.5s
</UIText>

        </CardContent>
      </Card>
    </Box>
  );
};
