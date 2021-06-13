import { createReducer } from '@reduxjs/toolkit';
import { CharacterId, normalize, PlayerId } from '@timeflies/common';
import { RoomStateData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import { RoomSetAction } from './room-actions';

export type RoomState = Omit<RoomStateData, 'staticPlayerList' | 'staticCharacterList'> & {
    staticPlayerList: { [ playerId in PlayerId ]: RoomStaticPlayer };
    staticCharacterList: { [ characterId in CharacterId ]: RoomStaticCharacter };
};

export const roomReducer = createReducer<RoomState | null>(null, {
    [ RoomSetAction.type ]: (state, { payload }: RoomSetAction) => {
        if (!payload) {
            return null;
        }

        const staticPlayerList = normalize(payload.staticPlayerList, 'playerId');
        const staticCharacterList = normalize(payload.staticCharacterList, 'characterId');

        return {
            ...payload,
            staticPlayerList,
            staticCharacterList
        };
    }
});
