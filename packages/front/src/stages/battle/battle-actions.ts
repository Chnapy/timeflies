import { createAction } from '@reduxjs/toolkit';
import { GlobalTurnSnapshot, Position, BattleSnapshot } from '@timeflies/shared';
import TiledMap from 'tiled-types/types';

export type BattleStartAction = ReturnType<typeof BattleStartAction>;
export const BattleStartAction = createAction<{
    tiledMapAssets: {
        schema: TiledMap;
        imagesUrls: Record<string, string>;
    };
    charactersPositionList: Position[];
    entitiesSnapshot: BattleSnapshot;
    globalTurnSnapshot: GlobalTurnSnapshot;
}>('battle/start');
