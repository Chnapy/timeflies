import { Box, Card, CardContent, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { ConnectedAppHeader } from '../connected-components/connected-app-header';
import { useGameNetwork } from '../hooks/useGameNetwork';
import { UIButton } from '../ui-components/button/ui-button';
import { UITypography } from '../ui-components/typography/ui-typography';
import { RoomListTable } from './room-list-table/room-list-table';

const useStyles = makeStyles(({ palette }) => ({
    root: {
        backgroundColor: palette.background.default,
        pointerEvents: 'all'
    },
    card: {
        height: '100%'
    },
    cardContent: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }
}));

export const UIRoomList: React.FC = () => {

    const classes = useStyles();

    const { sendCreate } = useGameNetwork({
        sendCreate: () => ({
            type: 'room-list/create'
        })
    });

    return (
        <Box className={classes.root} display='flex' flexDirection='column' height='100%'>
            <ConnectedAppHeader />

            <Box flexGrow={1} display='flex' p={2}>

                <Container maxWidth='md'>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>

                            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                                <UITypography variant='h2'>
                                    Room list
                            </UITypography>

                                <UIButton onClick={sendCreate}>
                                    Create new room
                            </UIButton>
                            </Box>

                            <RoomListTable />

                        </CardContent>
                    </Card>
                </Container>

            </Box>
        </Box>
    );
};
