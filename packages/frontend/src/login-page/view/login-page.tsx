import { Container, Grid, makeStyles } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { LoginForm } from './login-form';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center'
    },
    content: {
        height: '100%',
        maxHeight: 400
    }
}));

export const LoginPage: React.FC = () => {
    const classes = useStyles();

    return <Container className={classes.root} maxWidth='xs'>
        <Grid className={classes.content} container direction='column' justify='space-between' spacing={3}>

            <Grid item>
                <UIText variant='h1'>timeflies</UIText>
            </Grid>

            <Grid item>
                <LoginForm />
            </Grid>

        </Grid>
    </Container>;
};
