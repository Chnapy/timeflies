import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { BattleStateTurnStartAction, BattleStateTurnEndAction } from '../battleState/battle-state-actions';
import { Character } from '../entities/character/Character';
import { NotifyDeathsAction } from './cycle-manager-actions';
import { BattleStartAction } from '../battle-actions';
import { TurnSnapshot, TURN_DELAY } from '@timeflies/shared';
import { CycleState, getTurnState } from './cycle-reducer';

type Dependencies<S> = {
    extractState: (getState: () => S) => CycleState;
    extractCurrentCharacters: (getState: () => S) => Character<'current'>[];
};

export const cycleMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    extractState,
    extractCurrentCharacters
}) => api => next => {

    const getCharacter = (characterId: string): Character<'current'> => extractCurrentCharacters(api.getState)
        .find(c => c.id === characterId)!;

    const isCharacterDead = (characterId: string) => {

        const charactersDeadsIds = extractCurrentCharacters(api.getState)
            .filter(c => !c.isAlive)
            .map(c => c.id);

        return charactersDeadsIds.includes(characterId);
    };

    const getNextCharacterInfos = (currentCharacterId: string, index: number = 0): {
        id: string;
        duration: number;
    } | null => {
        const { globalTurnOrder } = extractState(api.getState);

        if (index === globalTurnOrder.length) {
            return null;
        }

        const orderIndex = globalTurnOrder.indexOf(currentCharacterId) + 1;

        const id = globalTurnOrder[ orderIndex % globalTurnOrder.length ];

        if (isCharacterDead(id)) {
            return getNextCharacterInfos(id, index + 1);
        }

        return {
            id,
            duration: getCharacter(id).features.actionTime
        };
    };

    const differTurnStart = (turnSnapshot: TurnSnapshot) => {

        const delta = turnSnapshot.startTime - Date.now();

        cancelTimeout();

        timeout = setTimeout(() => {

            api.dispatch(BattleStateTurnStartAction({
                turnSnapshot,

                // TODO
                isMine: true
            }));

            differTurnEnd(turnSnapshot.characterId, turnSnapshot.startTime);

        }, delta);
    };

    const differTurnEnd = (characterId: string, startTime?: number) => {

        cancelTimeout();

        const character = getCharacter(characterId);

        const endTime = startTime
            ? startTime + character.features.actionTime
            : Date.now();
        const duration = endTime - Date.now();

        timeout = setTimeout(() => {

            api.dispatch(BattleStateTurnEndAction());

            const { turnId, currentCharacterId } = extractState(api.getState);

            const nextChar = getNextCharacterInfos(currentCharacterId);

            if (nextChar) {
                differTurnStart({
                    id: turnId + 1,
                    startTime: endTime + TURN_DELAY,
                    characterId: nextChar.id,
                    duration: nextChar.duration
                });
            }

        }, duration);
    };

    const turnQueue: TurnSnapshot[] = [];

    let timeout: NodeJS.Timeout | null = null;

    const cancelTimeout = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return (action: AnyAction) => {

        if (BattleStartAction.match(action)) {

            const { globalTurnSnapshot } = action.payload;

            differTurnStart(globalTurnSnapshot.currentTurn);

        } else if (ReceiveMessageAction.match(action)) {

            const { payload } = action;

            if (payload.type === 'battle-run/turn-start') {

                const state = extractState(api.getState);

                const { id, characterId, startTime } = payload.turnState;

                if (state.turnId === id) {

                    if (state.turnStartTime !== startTime) {

                        differTurnEnd(characterId, startTime);
                    }

                } else if (id === state.turnId + 1) {

                    if (getTurnState(state) === 'ended') {

                        differTurnStart(payload.turnState);

                    } else {

                        turnQueue.push(payload.turnState);
                    }
                } else {
                    // case not handled, should not happen
                }

            } else if (payload.type === 'battle-run/end') {

                cancelTimeout();

                api.dispatch(BattleStateTurnEndAction());
            }

        } else if (NotifyDeathsAction.match(action)) {

            const { currentCharacterId } = extractState(api.getState);

            if (isCharacterDead(currentCharacterId)) {
                differTurnEnd(currentCharacterId);
            }
        }

        next(action);
    };
};
