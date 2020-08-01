import { createReducer } from '@reduxjs/toolkit';
import { GameStateStep } from '../../game-state';
import { ReceiveMessageAction } from '../../socket/wsclient-actions';
import { BattleStartAction } from '../../stages/battle/battle-actions';

const initialState: GameStateStep = 'auth' as GameStateStep;

// TODO consider replace each action by a single one
export const stepReducer = createReducer(initialState, {
    // [RoomListStart.type]: () => 'roomList',
    [ReceiveMessageAction.type]: (state, { payload }: ReceiveMessageAction) => {

        if(payload.type === 'auth/credentials') {
            return 'roomList';
        }

        if (payload.type === 'room/state') {
            return 'room';
        }
    },
    // [ RoomStartAction.type ]: () => 'room',
    [BattleStartAction.type]: () => 'battle',
});
