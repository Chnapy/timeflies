import { Divider, Grid, List, ListItem, Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { switchUtil } from '@timeflies/shared';
import React from 'react';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useGameStep } from '../../hooks/useGameStep';
import { UITypography } from '../../ui-components/typography/ui-typography';

const useStyles = makeStyles(({ palette }) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: palette.background.level1
    }
}));

const Cell: React.FC = ({ children }) => <Grid item xs={3} style={{ padding: 8 }}>
    {children}
</Grid>

export const RoomListTable: React.FC = () => {

    const classes = useStyles();

    const renderHeadCells = (...strList: string[]) => strList.map(str => <Cell key={str}>
        <UITypography variant='h3'>{str}</UITypography>
    </Cell>);

    return (
        <List className={classes.root} component={Paper}>

            <ListItem>
                <Grid container>
                    {
                        renderHeadCells(
                            'Room admin',
                            'Map',
                            'Players',
                            'State'
                        )
                    }
                </Grid>
            </ListItem>

            <Divider />

            <RoomTableBody />

        </List>
    )
};

const RoomTableBody: React.FC = () => {

    const ids = useGameStep('roomList', roomList => roomList.ids);

    const emptyState = ids.length === 0
        ? <Box flexGrow={1} display='flex' justifyContent='center' alignItems='center'>
            <UITypography variant='body1' align='center' gutterBottom>
                Hmmm... there is no rooms...
            <br />
                <UITypography variant='h4'>
                    create yours !
                </UITypography>
            </UITypography>
        </Box>
        : null;

    return (
        <>
            {ids.map(id => (
                <React.Fragment key={id}>
                    <RoomTableRow id={id} />
                    <Divider />
                </React.Fragment>
            ))}

            {emptyState}
        </>
    );
};

const RoomTableRow: React.FC<{ id: string }> = ({ id }) => {

    const { adminName, mapName, nbrPlayersMax, nbrPlayersCurrent, roomState } = useGameStep('roomList', roomList => roomList.list[ id ]);

    const { sendJoin } = useGameNetwork({
        sendJoin: () => ({
            type: 'room-list/join',
            roomId: id
        })
    });

    const disabled = roomState !== 'open';

    const renderCell = (str: string, typoH4: boolean = false) => <Cell>
        <UITypography variant={typoH4 ? 'h4' : 'body1'}>
            {str}
        </UITypography>
    </Cell>;

    return (
        <ListItem
            button
            disabled={disabled}
            onClick={sendJoin}
        >
            <Grid container>
                {renderCell(adminName)}

                {renderCell(mapName ?? '-')}

                {renderCell(nbrPlayersMax
                    ? nbrPlayersCurrent + '/' + nbrPlayersMax
                    : '-')}

                {renderCell(switchUtil(roomState, {
                    open: 'open',
                    "no-map": 'no map',
                    "players-full": 'full players',
                    "in-battle": 'in battle'
                }), true)}

            </Grid>
        </ListItem>
    );
};
