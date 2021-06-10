import { Container, makeStyles } from '@material-ui/core';
import React from 'react';
import { AppHeader } from '../../room-list-page/view/app-header';
import { RoomContent } from './room-content';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    container: {
        flexGrow: 1,
        overflow: 'hidden',
        marginTop: spacing(2),
        marginBottom: spacing(1)
    }
}));

export const RoomPage: React.FC = () => {
    const classes = useStyles();

    return <div className={classes.root}>
        <AppHeader />

        <Container className={classes.container}>
            <RoomContent />
        </Container>
    </div>;
};
