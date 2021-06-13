import { Box, lighten, makeStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { UIButton, UIText } from '@timeflies/app-ui';
import { waitMs } from '@timeflies/common';
import { RoomInfos, RoomListCreateRoomMessage, RoomListGetListMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { routes } from '../../routes';

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        padding: spacing(2)
    },
    tableContainer: {
        overflow: 'auto'
    },
    rowClickable: {
        backgroundColor: palette.background.level1,
        cursor: 'pointer',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',

        '&:hover': {
            backgroundColor: lighten(palette.background.level1, 0.08)
        }
    },
    btn: {
        marginTop: spacing(1)
    }
}));

const StyledTableHeadCell: React.FC = ({ children }) => (
    <TableCell>
        <UIText variant='h3'>
            {children}
        </UIText>
    </TableCell>
);

const StyledTableBodyCell: React.FC = ({ children }) => (
    <TableCell>
        <UIText variant='body1'>
            {children}
        </UIText>
    </TableCell>
);

export const RoomListTable: React.FC = () => {
    const classes = useStyles();
    const [ roomList, setRoomList ] = React.useState<RoomInfos[]>([]);
    const history = useHistory();
    const sendWithResponse = useSocketSendWithResponseError();

    const getOnRoomSelect = (roomId: string) => () => {
        history.push(routes.roomPage({ roomId }).path);
    };

    const onCreateRoom = async () => {
        const response = await sendWithResponse(RoomListCreateRoomMessage({}));
        if (!response) {
            return;
        }

        history.push(
            routes.roomPage({ roomId: response.payload.roomId }).path
        );
    };

    useAsyncEffect(async function fetchListEveryInterval(isMounted): Promise<void> {
        const response = await sendWithResponse(RoomListGetListMessage({}), isMounted);
        if (!response) {
            return;
        }

        setRoomList(response.payload);

        await waitMs(5000);

        if (!isMounted()) {
            return;
        }

        return fetchListEveryInterval(isMounted);
    }, []);

    return (
        <Paper className={classes.root}>
            <div className={classes.tableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableHeadCell>room admin</StyledTableHeadCell>
                            <StyledTableHeadCell>map</StyledTableHeadCell>
                            <StyledTableHeadCell>players</StyledTableHeadCell>
                            <StyledTableHeadCell>state</StyledTableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roomList.map(({ roomId, playerAdmin, map, nbrPlayers, state }) => (
                            <TableRow
                                key={roomId}
                                className={state === 'open'
                                    ? classes.rowClickable
                                    : undefined}
                                onClick={state === 'open'
                                    ? getOnRoomSelect(roomId)
                                    : undefined}
                            >
                                <StyledTableBodyCell>{playerAdmin.playerName}</StyledTableBodyCell>
                                <StyledTableBodyCell>{map ? map.name : '-'}</StyledTableBodyCell>
                                <StyledTableBodyCell>{nbrPlayers}</StyledTableBodyCell>
                                <StyledTableBodyCell>{state}</StyledTableBodyCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {roomList.length === 0 && (
                    <Box p={2}>
                        <UIText variant='body1' align='center'>
                            there is no room, create yours !
                    </UIText>
                    </Box>
                )}
            </div>

            <UIButton className={classes.btn} onClick={onCreateRoom} fullWidth>
                create new room
            </UIButton>
        </Paper>
    );
};
