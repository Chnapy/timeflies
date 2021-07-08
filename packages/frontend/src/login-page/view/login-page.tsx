import { Container, Grid, makeStyles } from '@material-ui/core';
import { UIText, usePlayMusic } from '@timeflies/app-ui';
import React from 'react';
import { OptionsButton } from '../../components/options/options-button';
import { LoginForm } from './login-form';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        position: 'relative'
    },
    content: {
        height: '100%',
        maxHeight: 400
    },
    header: {
        position: 'absolute',
        alignSelf: 'flex-start',
        top: spacing(2),
        right: spacing(2)
    }
}));

export const LoginPage: React.FC = () => {
    const classes = useStyles();
    usePlayMusic('menu');

    return <Container className={classes.root} maxWidth='xs'>

        <Grid className={classes.content} container direction='column' justify='space-between' wrap='nowrap' spacing={3}>

            <Grid item>
                <UIText variant='h1'>timeflies</UIText>
            </Grid>

            <Grid item>
                <LoginForm />
            </Grid>

        </Grid>

        <div className={classes.header}>
            <OptionsButton />
        </div>
    </Container>;
};
