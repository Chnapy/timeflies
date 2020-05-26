import { createAction } from '@reduxjs/toolkit';
import { TiledMapAssets } from '@timeflies/shared';

export type MapLoadedAction = ReturnType<typeof MapLoadedAction>;

export const MapLoadedAction = createAction<{ assets: TiledMapAssets }>('room/map/loaded')
