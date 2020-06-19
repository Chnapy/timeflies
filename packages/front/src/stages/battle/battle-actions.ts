import { createAction } from '@reduxjs/toolkit';
import { BattleSnapshot, GlobalTurnSnapshot, PlayerSnapshot, TeamSnapshot } from '@timeflies/shared';
import TiledMap from 'tiled-types/types';

export type BattleStartAction = ReturnType<typeof BattleStartAction>;
export const BattleStartAction = createAction<{
    myPlayerId: string;
    tiledMapAssets: {
        schema: TiledMap;
        imagesUrls: Record<string, string>;
    };
    teamSnapshotList: TeamSnapshot[];
    playerSnapshotList: PlayerSnapshot[];
    entitiesSnapshot: BattleSnapshot;
    globalTurnSnapshot: GlobalTurnSnapshot;
}>('battle/start');
