import { Dialog, Grid, IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { UIText, useWithSound } from '@timeflies/app-ui';
import { MapInfos, RoomMapListGetMessage, RoomMapSelectMessage } from '@timeflies/socket-messages';
import React from 'react';
import useAsyncEffect from 'use-async-effect';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomMapButton } from './room-map-button';

type RoomMapListProps = {
    open: boolean;
    onClose: () => void;
};

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        overflow: 'hidden'
    },
    content: {
        height: '100%',
        padding: spacing(2)
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    list: {
        flexGrow: 1,
        overflowY: 'auto'
    }
}));

const emptyArray: MapInfos[] = [];

export const RoomMapList: React.FC<RoomMapListProps> = ({ open, onClose }) => {
    const classes = useStyles();
    const withSound = useWithSound('buttonClick');
    const sendWithResponse = useSocketSendWithResponseError();
    const sendRoomUpdate = useSendRoomUpdate();
    const selectedMapId = useRoomSelector(state => state.mapInfos?.mapId);
    const [ mapList, setMapList ] = React.useState<MapInfos[]>(emptyArray);

    useAsyncEffect(async (isMounted) => {
        if (!open) {
            setMapList(emptyArray);
            return;
        }

        const response = await sendWithResponse(RoomMapListGetMessage({}), isMounted);
        if (!response) {
            return;
        }

        setMapList(response.payload);
    }, [ open ]);

    const getMapSelect = (mapId: string) => async () => {
        await sendRoomUpdate(RoomMapSelectMessage({ mapId }));
        onClose();
    };

    return (
        <Dialog classes={{ paper: classes.root }} fullScreen open={open} onClose={withSound(onClose)}>
            <Grid className={classes.content} container direction='column' spacing={2}>

                <Grid className={classes.header} item>
                    <UIText variant='h3'>Map select</UIText>
                    <IconButton onClick={withSound(onClose)}>
                        <CloseIcon />
                    </IconButton>
                </Grid>

                <Grid className={classes.list} item>
                    <Grid container spacing={2}>
                        {mapList.map(map => (
                            <Grid key={map.mapId} item>
                                <RoomMapButton
                                    mapInfos={map}
                                    disabled={selectedMapId === map.mapId}
                                    onClick={getMapSelect(map.mapId)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Dialog>
    );
};
