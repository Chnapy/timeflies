import { UIThemeProvider } from '../../ui-theme-provider';
import React from 'react';
import { Box } from '@material-ui/core';
import { UITypography } from './ui-typography';

export default {
    title: 'UI components/Typography'
};

export const Default = () => {

    return <UIThemeProvider>
        <Box p={2}>

            <UITypography variant="h1" gutterBottom>
                h1. Heading
      </UITypography>
            <UITypography variant="h2" gutterBottom>
                h2. Heading
      </UITypography>
            <UITypography variant="h3" gutterBottom>
                h3. Heading
      </UITypography>
            <UITypography variant="h4" gutterBottom>
                h4. Heading
      </UITypography>

            <UITypography variant="body1" gutterBottom>
                body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
                unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
                dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
      </UITypography>
            <UITypography variant="body2" gutterBottom>
                body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
                unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
                dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
      </UITypography>

      <UITypography variant="bodyMini" gutterBottom>
                body mini
      </UITypography>
            <UITypography variant="labelMini" gutterBottom>
                label mini
      </UITypography>
            <UITypography variant="numeric" gutterBottom>
                12.4s
      </UITypography>

        </Box>
    </UIThemeProvider>;
};
