import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { UITextField } from './ui-text-field';

export default {
  title: 'UI/Text field',
} as Meta;

export const Default: React.FC = () => {

  return (
    <Box p={2}>

      <div>
        <UITextField />
      </div>

      <div>
        <UITextField center />
      </div>

    </Box>
  );
};
