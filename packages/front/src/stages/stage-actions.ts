import { createAction } from '@reduxjs/toolkit';
import { ExtractPayload, StageKey } from './StageManager';
import { StageGraphicCreateParam } from '../canvas/GameCanvas';

type Payload<K extends StageKey> = {
    stageKey: K;
    data: ExtractPayload<K>;
};

export type StageChangeAction<K extends StageKey = StageKey> = ReturnType<typeof StageChangeAction>;
export const StageChangeAction = createAction('stage/change', <K extends StageKey>(payload: Payload<K>) => ({ payload }));

export const stageChangeActionPayloadMatch = <K extends StageKey>(stageKey: K, payload: Payload<any>): payload is Payload<K> =>
    payload.stageKey === stageKey;

export type StageOnCreateGraphicAction<K extends StageKey> = ReturnType<typeof StageOnCreateGraphicAction>;
export const StageOnCreateGraphicAction = createAction<{
    param: StageGraphicCreateParam<StageKey>;
}>('stage/onCreate/graphic');
