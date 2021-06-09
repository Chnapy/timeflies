import { createAction } from '@reduxjs/toolkit';
import { RoomStateData } from '@timeflies/socket-messages';

export type RoomSetAction = ReturnType<typeof RoomSetAction>;
export const RoomSetAction = createAction<RoomStateData | null>('room/set');
