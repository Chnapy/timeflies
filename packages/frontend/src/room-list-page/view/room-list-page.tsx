import { Container, makeStyles } from '@material-ui/core';
import React from 'react';
import { AppHeader } from '../../components/app-header';
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

    return <div className={classes.root}>
        <AppHeader />

        <Container className={classes.container} maxWidth='sm'>
            <RoomListTable />
        </Container>
    </div>;
};
