import { Container, Grid, Link, makeStyles } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import { UIText, usePlayMusic } from '@timeflies/app-ui';
import React from 'react';
import { OptionsButton } from '../../components/options/options-button';
import { useOrientationLockSetter } from '../../components/orientation-lock/orientation-lock-context';
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
    footer: {
        position: 'absolute',
        alignSelf: 'flex-end',
        bottom: spacing(2),
        right: spacing(2),
        left: spacing(2)
    },
    footerIcon: {
        verticalAlign: 'middle',
        marginLeft: spacing(1)
    }
}));

export const LoginPage: React.FC = () => {
    const classes = useStyles();
    usePlayMusic('menu');
    useOrientationLockSetter(false);

    return <Container className={classes.root} maxWidth='xs'>

        <Grid className={classes.content} container direction='column' justify='space-between' wrap='nowrap' spacing={3}>

            <Grid item>
                <UIText variant='h1'>timeflies</UIText>
            </Grid>

            <Grid item>
                <LoginForm />
            </Grid>

        </Grid>

        <div className={classes.footer}>
            <Grid container justify='space-between' wrap='nowrap' alignItems='center' spacing={1}>
                <Grid item>
                    <OptionsButton />
                </Grid>

                <Grid item>
                    <Link href='https://github.com/Chnapy/timeflies' target='_blank' rel='noopener' color='inherit'>
                        repository & credits
                        <GitHubIcon className={classes.footerIcon} />
                    </Link>
                </Grid>
            </Grid>
        </div>
    </Container>;
};
