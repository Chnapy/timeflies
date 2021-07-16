import { CharacterId } from '@timeflies/common';
import { RoomCharacterRemoveMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomCharacterButton } from './room-character-button';

type RoomCharacterProps = {
    characterId: CharacterId;
};

export const RoomCharacter: React.FC<RoomCharacterProps> = ({ characterId }) => {
    const myPlayerId = useMyPlayerId();
    const isReady = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].ready);
    const isMyCharacterOrAI = useRoomSelector(state => {
        const { playerId } = state.staticCharacterList[ characterId ];
        return playerId === myPlayerId || state.staticPlayerList[ playerId ].type === 'ai';
    });

    const sendRoomUpdate = useSendRoomUpdate();
    const onRemove = () => sendRoomUpdate(RoomCharacterRemoveMessage({ characterId }));

    const sizingProps = isMyCharacterOrAI
        ? {}
        : {
            size: 24,
            borderWidth: 2,
            scale: 1
        };

    return (
        <RoomCharacterButton
            characterId={characterId}
            {...sizingProps}
            disabled={!isMyCharacterOrAI || isReady}
            onClick={onRemove}
        />
    );
};
