import { Dialog, Grid, IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { UIText } from '@timeflies/app-ui';
import { CharacterRole } from '@timeflies/common';
import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { RoomCharacterSelectMessage, RoomEntityListGetMessage, RoomEntityListGetMessageData, SocketErrorMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import useAsyncEffect from 'use-async-effect';
import { ErrorListAddAction } from '../../error-list/store/error-list-actions';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomCharacterCard } from './room-character-card';

type RoomCharacterListProps = {
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

const emptyList: RoomEntityListGetMessageData = { characterList: [], spellList: [] };

export const RoomCharacterList: React.FC<RoomCharacterListProps> = ({ open, onClose }) => {
    const classes = useStyles();
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();
    const sendRoomUpdate = useSendRoomUpdate();
    const [ entityList, setEntityList ] = React.useState<RoomEntityListGetMessageData>(emptyList);

    useAsyncEffect(async (isMounted) => {
        if (!open) {
            setEntityList(emptyList);
            return;
        }

        const response = await sendWithResponse(RoomEntityListGetMessage({}));

        if (!isMounted()) {
            return;
        }

        if (SocketErrorMessage.match(response)) {
            dispatch(ErrorListAddAction({ code: response.payload.code }));
            return;
        }

        setEntityList(response.payload);
    }, [ open ]);

    const getCharacterSelect = (characterRole: CharacterRole) => async () => {
        await sendRoomUpdate(RoomCharacterSelectMessage({ characterRole }));
        onClose();
    };

    return (
        <Dialog classes={{ paper: classes.root }} fullScreen open={open} onClose={onClose}>
            <Grid className={classes.content} container direction='column' spacing={2}>

                <Grid className={classes.header} item>
                    <UIText variant='h3'>Character select</UIText>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>

                <Grid className={classes.list} item>
                    <Grid container spacing={2}>
                        {entityList.characterList.map(character => (
                            <Grid key={character.characterRole} item>
                                <RoomCharacterCard
                                    character={character}
                                    spellList={entityList.spellList.filter(({ characterRole }) => characterRole === character.characterRole)}
                                    onClick={getCharacterSelect(character.characterRole)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Dialog>
    );
};
