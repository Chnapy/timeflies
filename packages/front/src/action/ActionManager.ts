import { ActionLogger } from './ActionLogger';
import { GameAction } from './game-action/GameAction';
import { Middleware } from 'redux';
import { GameState } from '../game-state';

export interface ActionManager {
    beginBattleSession(): void;
    endBattleSession(): void;
    addActionListener(type: GameAction[ 'type' ], fn: ActionListener<GameAction>): ActionListenerObject;
    getMiddleware(): Middleware<{}, GameState>;
}

export interface ActionListener<A extends GameAction> {
    (action: A): void;
}

export interface ActionListenerObject {
    removeActionListener: () => void;
}

type ListenerMap = Map<GameAction[ 'type' ], Set<ActionListener<GameAction>>>;

export const ActionManager = (): ActionManager => {

    const commonListenerMap: ListenerMap = new Map();

    const battleListenerMap: ListenerMap = new Map();

    const logger = ActionLogger();

    let battleSession = false;

    const getListenerMap = (): ListenerMap[] => battleSession
        ? [ battleListenerMap, commonListenerMap ]
        : [ commonListenerMap ];

    return {

        beginBattleSession() {
            battleSession = true;
        },

        endBattleSession() {
            battleSession = false;
            battleListenerMap.clear();
        },

        addActionListener(type, fn) {
            const map = getListenerMap()[ 0 ];
            const values = map.get(type) ?? new Set();
            values.add(fn);
            map.set(type, values);

            return {
                removeActionListener: () => {
                    values.delete(fn);
                }
            }
        },

        getMiddleware() {
            return api => next => action => {

                // TODO use redux-logger
                logger.log(action);

                const maps = getListenerMap();

                maps.forEach(map => {
                    map.get(action.type)?.forEach(fn => fn(action));

                    if (action.type === 'app/reset') {
                        map.clear();
                    }
                });

                next(action);
            };
        }
    }
};
