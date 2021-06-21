import { Grid, makeStyles } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { UIText } from '@timeflies/app-ui';
import React from 'react';

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        position: 'relative',
        display: 'inline-block',
        pointerEvents: 'none',
        backdropFilter: 'blur(2px)'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: palette.background.paper,
        opacity: 0.5,
        zIndex: -1
    },
    content: {
        padding: spacing(1, 2)
    },
    icon: {
        verticalAlign: 'middle'
    }
}));

export const SpectatorPanel: React.FC = () => {
    const classes = useStyles();

    return <div className={classes.root}>
        <div className={classes.background} />
        <div className={classes.content}>
            <UIText variant='body1'>
                <Grid container spacing={1}>
                    <Grid item>
                        <VisibilityIcon className={classes.icon} />
                    </Grid>
                    <Grid item>
                        <UIText variant='body1'>spectator</UIText>
                    </Grid>
                </Grid>
            </UIText>
        </div>
    </div>;
};
