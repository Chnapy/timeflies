import { createReducer } from '@reduxjs/toolkit';
import { GameStateStep } from '../../game-state';
import { ReceiveMessageAction } from '../../socket/wsclient-actions';
import { BattleStartAction } from '../../stages/battle/battle-actions';
import { RoomListStart } from './room-list-reducers/room-list-actions';

// TODO consider replace each action by a single one
export const stepReducer = createReducer('boot' as GameStateStep, {
    [ RoomListStart.type ]: () => 'roomList',
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {
        if (payload.type === 'room/state') {
            return 'room';
        }
    },
    // [ RoomStartAction.type ]: () => 'room',
    [ BattleStartAction.type ]: () => 'battle',
});
