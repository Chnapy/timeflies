import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { characterIsAlive, Normalized, TurnSnapshot, TURN_DELAY, WaitTimeoutPromise } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { waitTimeoutPool } from '../../../wait-timeout-pool';
import { BattleStartAction } from '../battle-actions';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { Character } from '../entities/character/Character';
import { NotifyDeathsAction } from './cycle-manager-actions';
import { CycleState, getTurnState } from './cycle-reducer';

type Dependencies<S> = {
    extractState: (getState: () => S) => CycleState;
    extractCurrentCharacters: (getState: () => S) => Normalized<Character<'current'>>;
};

export const cycleMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    extractState,
    extractCurrentCharacters
}) => (api: MiddlewareAPI) => next => {

    const getCharacter = (characterId: string): Character<'current'> => extractCurrentCharacters(api.getState)[characterId];

    const isCharacterDead = (characterId: string) => {

        return !characterIsAlive(extractCurrentCharacters(api.getState)[characterId]);
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

        const id = globalTurnOrder[orderIndex % globalTurnOrder.length];

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

        timeout = waitTimeoutPool.createTimeout(delta)
            .onCompleted(async () => {
                const currentCharacter = extractCurrentCharacters(api.getState)[turnSnapshot.characterId];

                console.log();
                console.log('--- TURN-START ---');
                console.table({
                    turnId: turnSnapshot.id,
                    duration: turnSnapshot.duration,
                    playerId: currentCharacter.playerId,
                    characterId: turnSnapshot.characterId
                });
                console.log('--- ---------- ---');
                console.log();

                await api.dispatch(BattleStateTurnStartAction({
                    turnSnapshot,
                    currentCharacter
                }));

                differTurnEnd(turnSnapshot.characterId, turnSnapshot.startTime);

                await timeout;
            });
    };

    const differTurnEnd = (characterId: string, startTime?: number) => {

        cancelTimeout();

        const character = getCharacter(characterId);

        const endTime = startTime
            ? startTime + character.features.actionTime
            : Date.now();
        const duration = endTime - Date.now();

        timeout = waitTimeoutPool.createTimeout(duration)
            .onCompleted(async () => {

                await api.dispatch(BattleStateTurnEndAction());

                const { turnId, currentCharacterId } = extractState(api.getState);

                const nextChar = getNextCharacterInfos(currentCharacterId);

                if (nextChar) {
                    differTurnStart({
                        id: turnId + 1,
                        startTime: endTime + TURN_DELAY,
                        characterId: nextChar.id,
                        duration: nextChar.duration
                    });

                    await timeout;
                }
            });
    };

    const turnQueue: TurnSnapshot[] = [];

    let timeout: WaitTimeoutPromise<any> | null = null;

    const cancelTimeout = () => {
        if (timeout) {
            timeout.cancel();
            timeout = null;
        }
    };

    return async (action: AnyAction) => {

        const ret = next(action);

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

                await api.dispatch(BattleStateTurnEndAction());
            }

        } else if (NotifyDeathsAction.match(action)) {

            const { currentCharacterId } = extractState(api.getState);

            if (isCharacterDead(currentCharacterId)) {
                differTurnEnd(currentCharacterId);
            }
        }

        // 'timeout' is never waited since it never ends 

        return ret;
    };
};
