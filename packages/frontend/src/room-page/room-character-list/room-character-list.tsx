import { Dialog, Grid, IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { UIText, useWithSound } from '@timeflies/app-ui';
import { CharacterRole, PlayerId } from '@timeflies/common';
import { RoomCharacterSelectMessage, RoomEntityListGetMessage, RoomEntityListGetMessageData } from '@timeflies/socket-messages';
import React from 'react';
import useAsyncEffect from 'use-async-effect';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomCharacterCard } from './room-character-card';

type RoomCharacterListProps = {
    playerId: PlayerId | null;
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

export const RoomCharacterList: React.FC<RoomCharacterListProps> = ({ playerId, onClose }) => {
    const classes = useStyles();
    const withSound = useWithSound('buttonClick');
    const sendWithResponse = useSocketSendWithResponseError();
    const sendRoomUpdate = useSendRoomUpdate();
    const [ entityList, setEntityList ] = React.useState<RoomEntityListGetMessageData>(emptyList);
    const myPlayerId = useMyPlayerId();

    const open = !!playerId;
    const aiPlayerId = playerId === myPlayerId ? null : playerId;

    useAsyncEffect(async (isMounted) => {
        if (!open) {
            setEntityList(emptyList);
            return;
        }

        const response = await sendWithResponse(RoomEntityListGetMessage({}), isMounted);
        if (!response) {
            return;
        }

        setEntityList(response.payload);
    }, [ open ]);

    const getCharacterSelect = (characterRole: CharacterRole) => async () => {
        await sendRoomUpdate(RoomCharacterSelectMessage({
            aiPlayerId,
            characterRole
        }));
        onClose();
    };

    return (
        <Dialog classes={{ paper: classes.root }} fullScreen open={open} onClose={withSound(onClose)}>
            <Grid className={classes.content} container direction='column' wrap='nowrap' spacing={2}>

                <Grid className={classes.header} item>
                    <UIText variant='h3'>Character select</UIText>
                    <IconButton onClick={withSound(onClose)}>
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
