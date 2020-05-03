import React from 'react';
import { Button } from '@material-ui/core';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useCurrentPlayerRoom } from '../hooks/useCurrentPlayerRoom';
import CheckIcon from '@material-ui/icons/Check';

export const ReadyButton: React.FC = () => {

    const { sendReadyState } = useGameNetwork({
        sendReadyState: (isReady: boolean, isLoading: boolean) => ({
            type: 'room/player/state',
            isReady,
            isLoading
        })
    });

    const { isReady, isLoading } = useCurrentPlayerRoom();

    const onClick = () => sendReadyState(!isReady, isLoading);

    return <Button
        variant='outlined'
        onClick={onClick}
        endIcon={isReady ? <CheckIcon /> : null}
    >
        I'm ready
    </Button>;
};
