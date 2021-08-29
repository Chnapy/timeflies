import { Container, makeStyles } from '@material-ui/core';
import { usePlayMusic } from '@timeflies/app-ui';
import React from 'react';
import { AppHeader } from '../../components/app-header/app-header';
import { useOrientationLockSetter } from '../../components/orientation-lock/orientation-lock-context';
import { RoomContent } from './room-content';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    container: {
        position: 'relative',
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
        marginTop: spacing(2),
        marginBottom: spacing(1)
    }
}));

export const RoomPage: React.FC = () => {
    const classes = useStyles();
    usePlayMusic('menu');
    useOrientationLockSetter(true);

    return <div className={classes.root}>
        <AppHeader />

        <Container className={classes.container}>
            <RoomContent />
        </Container>
    </div>;
};
