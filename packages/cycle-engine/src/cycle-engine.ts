import { CycleEngineListeners } from './listeners';
import { getDiffFromNow, waitMs } from './utils';
import { WaitCancelableState, waitCanceleable } from './wait-cancelable';

type Duration = number;

type CharacterId = string;

type CharacterDurationMap = {
    [ id in CharacterId ]: Duration;
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
    characterId: string;
    roundIndex: number;
    promise: Promise<WaitCancelableState>;
    startTime: number;
    setDuration: (duration: number) => void;
    getDuration: () => number;
    getEndTime: () => number;
    cancel: () => void;
};

export type CycleEngineProps = {
    charactersDurations: CharacterDurationMap;
    charactersList: CharacterId[];
    listeners: CycleEngineListeners;
};

export const createCycleEngine = ({ charactersDurations, charactersList, listeners }: CycleEngineProps) => {

    const disabledCharacters = new Set<CharacterId>();

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

        const diff = getDiffFromNow(startTime);

        // if startTime is in future, wait for it
        await waitMs(-diff);

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

        promise.then(() => {
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
        });

        return promise;
    };

    const start = async (
        startTime: number = Date.now() + delays.battleStart
    ) => {
        await playTurn({
            turnIndex: 0,
            roundIndex: 0,
            characterIndex: 0,
            startTime
        });
    };

    const startNextTurn = async (nextTurnProps?: PlayTurnProps) => {
        if (!currentTurn) {
            throw new Error('Cycle engine current turn required. Engine need to be started');
        }

        await currentTurn.promise;

        if (nextTurnProps) {
            await playTurn(nextTurnProps);
        } else {
            const { characterIndex, roundIndex } = getEnabledCharacterIndex(currentTurn.characterIndex + 1, currentTurn.roundIndex);

            await playTurn({
                turnIndex: currentTurn.turnIndex + 1,
                roundIndex,
                characterIndex,
                startTime: currentTurn.getEndTime() + delays.betweenTurns
            });
        }
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
        if (!currentTurn || !isLastCharacterEnabled(currentTurn?.characterIndex)) {
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

    return {
        start,
        stop,
        startNextTurn,
        setCharacterDuration,
        disableCharacters,
        setTurnsOrder
    };
};
