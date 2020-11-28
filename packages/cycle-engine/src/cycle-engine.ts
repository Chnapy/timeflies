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
    characterIndex: number;
    startTime: number;
};

type Turn = {
    turnIndex: number;
    characterIndex: number;
    characterId: string;
    promise: Promise<WaitCancelableState>;
    startTime: number;
    setDuration: (duration: number) => void;
    getDuration: () => number;
    getEndTime: () => number;
    cancel: () => void;
};

export type CycleEngineProps = {
    charactersDurations: CharacterDurationMap;
    charactersDurationsList: CharacterId[];
    listeners: CycleEngineListeners;
};

export const createCycleEngine = ({ charactersDurations, charactersDurationsList, listeners }: CycleEngineProps) => {

    const disabledCharacters = new Set<CharacterId>();

    let currentTurn: Turn;

    const isCharacterDisabled = (id: CharacterId) => disabledCharacters.has(id);

    const getCharacterIndex = (rawIndex: number) => rawIndex % charactersDurationsList.length;

    const isLastCharacter = (index: number) => index === charactersDurationsList.length - 1;

    const playTurn = async ({
        turnIndex, characterIndex, startTime
    }: PlayTurnProps): Promise<WaitCancelableState> => {
        const characterId = charactersDurationsList[ characterIndex ];

        if (isCharacterDisabled(characterId)) {
            return playTurn({
                turnIndex,
                characterIndex: getCharacterIndex(characterIndex + 1),
                startTime
            });
        }

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
                }
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
                    }
                });
            }
        });

        return promise;
    };

    const start = async () => {
        const startTime = Date.now() + delays.battleStart;

        await playTurn({
            turnIndex: 0,
            characterIndex: 0,
            startTime
        });
    };

    const startNextTurn = async () => {
        const startTime = currentTurn.getEndTime() + delays.betweenTurns;

        await currentTurn.promise;

        await playTurn({
            turnIndex: currentTurn.turnIndex + 1,
            characterIndex: getCharacterIndex(currentTurn.characterIndex + 1),
            startTime
        });
    };

    const disableCharacter = (id: CharacterId) => {
        disabledCharacters.add(id);
        if (currentTurn.characterId === id) {
            currentTurn.cancel();
        }
    };

    const setCharacterDuration = (newCharactersDurations: CharacterDurationMap) => {
        charactersDurations = {
            ...charactersDurations,
            ...newCharactersDurations
        };

        if (newCharactersDurations[ currentTurn.characterId ] !== undefined) {
            currentTurn.setDuration(newCharactersDurations[ currentTurn.characterId ]);
        }
    };

    return {
        start,
        startNextTurn,
        setCharacterDuration,
        disableCharacter
    };
};
