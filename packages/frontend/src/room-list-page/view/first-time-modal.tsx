import { Box, Dialog, Grid } from '@material-ui/core';
import { UIButton, UIText, useWithSound } from '@timeflies/app-ui';
import { waitMs } from '@timeflies/common';
import React from 'react';
import { useAsyncEffect } from 'use-async-effect';


const storageFirstTimeKey = 'first-time';

const getIsFirstTime = (): boolean => {
    const firstTimeRaw = localStorage.getItem(storageFirstTimeKey);
    return (firstTimeRaw && JSON.parse(firstTimeRaw)) ?? true;
};

const setIsFirstTime = (open: boolean) => {
    localStorage.setItem(storageFirstTimeKey, JSON.stringify(open));
};

export const FirstTimeModal: React.FC = () => {
    const withSound = useWithSound('buttonClick');
    const [ open, setOpen ] = React.useReducer((prevOpen: boolean, nextOpen: boolean) => {
        setIsFirstTime(nextOpen);

        return nextOpen;
    }, false);

    const handleClose = () => setOpen(false);

    useAsyncEffect(async isMounted => {
        await waitMs(800);

        if (isMounted()) {
            setOpen(getIsFirstTime());
        }
    }, []);

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth='xs'
            onClose={withSound(handleClose)}
        >
            <Box p={4}>

                <Grid container spacing={2}>
                    <Grid item>
                        <UIText variant='h3'>First time playing ?</UIText>
                    </Grid>
                    <Grid item>
                        <UIText variant='body1'>
                            Consider starting game by training against an AI with a simple battle, in 1 vs 1.
                            <br />Then do biggest battles.
                    </UIText>
                    </Grid>
                    <Grid item xs>
                        <UIButton
                            variant='secondary'
                            onClick={handleClose}
                            fullWidth
                        >gotcha !</UIButton>
                    </Grid>
                </Grid>

            </Box>
        </Dialog>
    );
};
