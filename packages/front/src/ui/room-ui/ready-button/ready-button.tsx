import React from 'react';
import { Button } from '@material-ui/core';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useCurrentPlayerRoom } from '../hooks/useCurrentPlayerRoom';
import CheckIcon from '@material-ui/icons/Check';
import { useGameStep } from '../../hooks/useGameStep';

export const ReadyButton: React.FC = () => {

    const { sendReadyState } = useGameNetwork({
        sendReadyState: (isReady: boolean, isLoading: boolean) => ({
            type: 'room/player/state',
            isReady,
            isLoading
        })
    });

    const isReady = useCurrentPlayerRoom(p => p.isReady);
    const isLoading = useCurrentPlayerRoom(p => p.isLoading);
    const characters = useCurrentPlayerRoom(p => p.characters);

    const nbrTeams = useGameStep('room', ({ teamsTree }) => {
        return teamsTree.teamList
        .filter(t => t.playersIds.length > 0).length;
    });

    const disabled = characters.length === 0 || nbrTeams < 2;

    const onClick = () => sendReadyState(!isReady, isLoading);

    return <Button
        variant='outlined'
        onClick={onClick}
        endIcon={isReady ? <CheckIcon /> : null}
        disabled={disabled}
    >
        I'm ready
    </Button>;
};
