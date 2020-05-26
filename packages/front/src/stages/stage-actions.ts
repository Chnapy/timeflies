import { createAction } from '@reduxjs/toolkit';
import { ExtractPayload, StageKey } from './StageManager';

type Payload<K extends StageKey> = {
    stageKey: K;
    data: ExtractPayload<K>;
};

export type StageChangeAction<K extends StageKey = StageKey> = ReturnType<typeof StageChangeAction>;

export const StageChangeAction = createAction('stage/change', <K extends StageKey>(payload: Payload<K>) => ({ payload }));

export const stageChangeActionPayloadMatch = <K extends StageKey>(stageKey: K, payload: Payload<any>): payload is Payload<K> =>
    payload.stageKey === stageKey;
