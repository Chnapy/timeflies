import { TurnSnapshot } from "./TurnSnapshot";

export interface GlobalTurnSnapshot {
    id: number;
    startTime: number;
    order: string[];
    currentTurn: TurnSnapshot;
}

export const GLOBALTURN_DELAY = 2000;
