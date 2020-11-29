
export type TurnInfos = {
    turnIndex: number;
    characterIndex: number;
    characterId: string;
    startTime: number;
    duration: number;
    endTime: number;
};

type ListenerCommonBody = {
    currentTurn: TurnInfos;
    roundIndex: number;
    lastRoundTurn: boolean;
};

export type TurnStartParams = ListenerCommonBody

export type TurnEndParams = ListenerCommonBody & {
    currentTurn: {
        endTimeDelta: number;
    };
};

export type CycleEngineListeners = {
    turnStart?: (params: TurnStartParams) => void;
    turnEnd?: (params: TurnEndParams) => void;
};
