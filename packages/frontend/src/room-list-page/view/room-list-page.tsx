import { Container, makeStyles } from '@material-ui/core';
import { usePlayMusic } from '@timeflies/app-ui';
import React from 'react';
import { AppHeader } from '../../components/app-header/app-header';
import { FirstTimeModal } from './first-time-modal';
import { RoomListTable } from './room-list-table';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    container: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1
    }
}));

export const RoomListPage: React.FC = () => {
    const classes = useStyles();
    usePlayMusic('menu');

    return <div className={classes.root}>
        <AppHeader />

        <Container className={classes.container} maxWidth='sm'>
            <RoomListTable />
        </Container>

        <FirstTimeModal />
    </div>;
};
