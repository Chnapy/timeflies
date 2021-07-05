import { Box, Dialog, Grid, IconButton } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { OptionsContent } from './options-content';
import CloseIcon from '@material-ui/icons/Close';

export const OptionsButton: React.FC = () => {
    const [ open, setOpen ] = React.useState(true);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return <>
        <IconButton onClick={handleOpen} size='small'>
            <SettingsIcon />
        </IconButton>

        <Dialog
            open={open}
            fullWidth
            maxWidth='xs'
            onClose={handleClose}
        >
            <Box p={2}>

                <Grid container>
                    <Grid item xs>
                        <UIText variant='h3' gutterBottom>Options</UIText>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={handleClose} size='small'>
                            <CloseIcon fontSize='inherit' />
                        </IconButton>
                    </Grid>
                </Grid>

                <OptionsContent />

            </Box>
        </Dialog>
    </>;
};
