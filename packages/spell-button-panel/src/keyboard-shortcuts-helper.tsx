import { Box, Grid, IconButton, Paper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import Looks3Icon from '@material-ui/icons/Looks3';
import Looks4Icon from '@material-ui/icons/Looks4';
import Looks1Icon from '@material-ui/icons/LooksOne';
import Looks2Icon from '@material-ui/icons/LooksTwo';
import { useIsMobile, useWithSound } from '@timeflies/app-ui';
import React from 'react';

const storageShortcutsHelperKey = 'shortcuts-helper';

const getHasShortcutsHelper = (): boolean => {
    const shortcutsHelperRaw = localStorage.getItem(storageShortcutsHelperKey);
    return (shortcutsHelperRaw && JSON.parse(shortcutsHelperRaw)) ?? true;
};

const setHasShortcutsHelper = (hasHelper: boolean) => {
    localStorage.setItem(storageShortcutsHelperKey, JSON.stringify(hasHelper));
};

export const KeyboardShortcutsHelper: React.FC = () => {
    const isMobile = useIsMobile();
    const withSound = useWithSound('buttonClick');
    const [ open, setOpen ] = React.useReducer((prevOpen: boolean, nextOpen: boolean) => {
        setHasShortcutsHelper(nextOpen);

        return nextOpen;
    }, getHasShortcutsHelper());

    const handleClose = () => setOpen(false);

    if(isMobile || !open) {
        return null;
    }

    return (
        <Paper>
            <Box p={1}>

                <Grid container alignItems='center' justify='space-between' wrap='nowrap'>
                    <Grid item>
                        <KeyboardIcon />
                    </Grid>

                    <Grid item>
                        keyboard shortcuts
                    </Grid>

                    <Grid item>
                        <IconButton size='small' onClick={withSound(handleClose)}>
                            <CloseIcon fontSize='inherit' />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container justify='space-around' wrap='nowrap'>
                    <Grid item>
                        <Looks1Icon />
                    </Grid>

                    <Grid item>
                        <Looks2Icon />
                    </Grid>

                    <Grid item>
                        <Looks3Icon />
                    </Grid>

                    <Grid item>
                        <Looks4Icon />
                    </Grid>
                </Grid>

            </Box>
        </Paper >
    );
};
