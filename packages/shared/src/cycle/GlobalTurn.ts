import { TurnSnapshot } from "./Turn";

export interface GlobalTurnSnapshot {
    id: number;
    startTime: number;
    order: string[];
    currentTurn: TurnSnapshot;
}

export const GLOBALTURN_DELAY = 2000;
