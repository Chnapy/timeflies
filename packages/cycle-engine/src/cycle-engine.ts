import { CharacterDuration, CharacterId, getTimeDiffFromNow, WaitCancelableState, waitCanceleable, waitMs } from '@timeflies/common';
import { CycleEngineListeners } from './listeners';

type CharacterDurationMap = {
    [ id in CharacterId ]: CharacterDuration;
};

const delays = {
    battleStart: 8000,
    betweenTurns: 4000
};

type PlayTurnProps = {
    turnIndex: number;
    roundIndex: number;
    characterIndex: number;
    startTime: number;
};

type Turn = {
    turnIndex: number;
    characterIndex: number;
    characterId: CharacterId;
    roundIndex: number;
    promise: Promise<WaitCancelableState>;
    startTime: number;
    setDuration: (duration: number) => void;
    getDuration: () => number;
    getEndTime: () => number;
    cancel: () => void;
};

export type NextTurnInfos = {
    turnIndex: number;
    roundIndex: number;
    characterId: CharacterId;
    startTime: number;
};

export type CycleEngineProps = {
    charactersDurations: CharacterDurationMap;
    charactersList: CharacterId[];
    listeners: CycleEngineListeners;
};

export type CycleEngine = ReturnType<typeof createCycleEngine>;

export const createCycleEngine = ({ charactersDurations, charactersList, listeners }: CycleEngineProps) => {

    const disabledCharacters = new Set<CharacterId>();

    let firstTurnStartTime: number | null = null;

    let currentTurn: Turn | undefined;

    const isCharacterDisabled = (id: CharacterId) => disabledCharacters.has(id);

    const getEnabledCharacterIndex = (rawIndex: number, roundIndex: number): {
        characterIndex: number;
        roundIndex: number;
    } => {

        const index = charactersList
            .slice(rawIndex)
            .findIndex(id => !isCharacterDisabled(id));

        if (index === -1) {
            return getEnabledCharacterIndex(0, roundIndex + 1);
        }

        const characterIndex = index + rawIndex;

        return {
            characterIndex,
            roundIndex
        };
    };

    const isLastCharacterEnabled = (index: number) =>
        charactersList.slice(index + 1).every(isCharacterDisabled);

    const playTurn = async ({
        turnIndex, roundIndex, characterIndex, startTime
    }: PlayTurnProps): Promise<WaitCancelableState> => {

        const characterId = charactersList[ characterIndex ];

        const diff = getTimeDiffFromNow(startTime);

        // if startTime is in future, wait for it
        await waitMs(-diff);

        if(currentTurn) {
            currentTurn.cancel();
        }

        const duration = charactersDurations[ characterId ];

        const { promise, setTime, cancel, getDuration } = waitCanceleable(duration);

        const setDuration = (duration: number) => {
            setTime(duration);
        };

        const getEndTime = () => startTime + getDuration();

        currentTurn = {
            turnIndex,
            roundIndex,
            characterIndex,
            characterId,
            startTime,
            promise,
            setDuration,
            getDuration,
            getEndTime,
            cancel
        };

        if (listeners.turnStart) {
            listeners.turnStart({
                currentTurn: {
                    turnIndex,
                    characterIndex,
                    characterId,
                    startTime,
                    duration: getDuration(),
                    endTime: getEndTime()
                },
                roundIndex,
                lastRoundTurn: isLastCharacterEnabled(characterIndex)
            });
        }

        return promise.then(status => {
            if (listeners.turnEnd) {
                listeners.turnEnd({
                    currentTurn: {
                        turnIndex,
                        characterIndex,
                        characterId,
                        startTime,
                        duration: getDuration(),
                        endTime: getEndTime(),
                        endTimeDelta: Date.now() - getEndTime()
                    },
                    roundIndex,
                    lastRoundTurn: isLastCharacterEnabled(characterIndex)
                });
            }

            return status;
        });
    };

    const start = async (startTime: number = Date.now() + delays.battleStart) => {
        firstTurnStartTime = startTime;
        await playTurn(getNextTurnProps());
    };

    const getNextTurnProps = (): PlayTurnProps => {
        // first turn
        if (!currentTurn) {
            return {
                turnIndex: 0,
                roundIndex: 0,
                characterIndex: 0,
                startTime: firstTurnStartTime!
            };
        }

        const { characterIndex, roundIndex } = getEnabledCharacterIndex(currentTurn.characterIndex + 1, currentTurn.roundIndex);

        return {
            turnIndex: currentTurn.turnIndex + 1,
            roundIndex,
            characterIndex,
            startTime: currentTurn.getEndTime() + delays.betweenTurns
        };
    };

    const startNextTurn = async (nextTurnProps?: PlayTurnProps) => {
        if(!firstTurnStartTime) {
            firstTurnStartTime = nextTurnProps?.startTime ?? null;
        }

        await playTurn(nextTurnProps
            ? nextTurnProps
            : getNextTurnProps());
    };

    const getNextTurnInfos = (): NextTurnInfos => {
        const { roundIndex, turnIndex, characterIndex, startTime } = getNextTurnProps();

        return {
            roundIndex,
            turnIndex,
            characterId: charactersList[ characterIndex ],
            startTime
        };
    };

    const disableCharacters = (idList: CharacterId[]) => {
        idList.forEach(id => disabledCharacters.add(id));

        if (currentTurn && disabledCharacters.has(currentTurn.characterId)) {
            currentTurn.cancel();
        }
    };

    const setCharacterDuration = (newCharactersDurations: CharacterDurationMap) => {
        charactersDurations = {
            ...charactersDurations,
            ...newCharactersDurations
        };

        if (currentTurn && newCharactersDurations[ currentTurn.characterId ] !== undefined) {
            currentTurn.setDuration(newCharactersDurations[ currentTurn.characterId ]);
        }
    };

    const setTurnsOrder = (newCharactersList: CharacterId[]) => {
        if (!currentTurn || !isLastCharacterEnabled(currentTurn.characterIndex)) {
            throw new Error(`Cycle setTurnsOrder should be call after last character turn [${currentTurn?.characterIndex}/${charactersList.length - 1}]`);
        }

        charactersList = newCharactersList;
    };

    const stop = async () => {
        if (currentTurn) {
            currentTurn.cancel();
            await currentTurn.promise;
        }
    };

    const isStarted = () => firstTurnStartTime !== null;

    return {
        start,
        stop,
        startNextTurn,
        getNextTurnInfos,
        setCharacterDuration,
        disableCharacters,
        setTurnsOrder,
        isStarted
    };
};
