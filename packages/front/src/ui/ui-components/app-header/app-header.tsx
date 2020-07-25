import { AppBar, Box, Toolbar } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import React from 'react';
import { UITypography } from '../typography/ui-typography';

export type AppHeaderProps = {
    username: string;
};

export const AppHeader: React.FC<AppHeaderProps> = ({ username }) => {

    return <AppBar position="static" color='inherit'>
        <Toolbar variant="dense">
            <Box display='flex' flexGrow={1} justifyContent='space-between' alignItems='center'>
                <UITypography variant='h3'>Timeflies</UITypography>

                <Box>
                    <UITypography variant='body1'>
                        {username}
                        <PersonIcon style={{ verticalAlign: 'middle' }} />
                    </UITypography>
                </Box>
            </Box>
        </Toolbar>
    </AppBar>;
};
