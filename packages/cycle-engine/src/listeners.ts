
type TurnInfos = {
    turnIndex: number;
    characterIndex: number;
    characterId: string;
    startTime: number;
    duration: number;
    endTime: number;
};

export type TurnStartParams = {
    currentTurn: TurnInfos;
};

export type TurnEndParams = {
    currentTurn: TurnInfos & {
        endTimeDelta: number;
    };
};

export type CycleEngineListeners = {
    turnStart?: (params: TurnStartParams) => void;
    turnEnd?: (params: TurnEndParams) => void;
};
