import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import { RoomPlayerReadyMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';

export const RoomReadyButton: React.FC<Pick<UIButtonProps, 'startIcon'>> = ({ startIcon }) => {
    const sendRoomUpdate = useSendRoomUpdate();
    const myPlayerId = useMyPlayerId();
    const isReady = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].ready);

    const onClick = async () => {
        await sendRoomUpdate(RoomPlayerReadyMessage({
            ready: !isReady
        }));
    };

    return (
        <UIButton startIcon={startIcon} onClick={onClick}>
            ready ?
        </UIButton>
    );
};
