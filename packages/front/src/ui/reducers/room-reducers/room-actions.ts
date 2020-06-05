import { createAction } from '@reduxjs/toolkit';
import { RoomServerAction } from '@timeflies/shared';

export type RoomStartAction = ReturnType<typeof RoomStartAction>;
export const RoomStartAction = createAction<{
    roomState: RoomServerAction.RoomState;
}>('room/start');
