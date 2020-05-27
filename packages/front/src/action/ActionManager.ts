import { Middleware } from 'redux';
import { GameState } from '../game-state';
import { PayloadAction } from '@reduxjs/toolkit';

export interface ActionManager {
    beginBattleSession(): void;
    endBattleSession(): void;
    addActionListener(type: string, fn: PayloadActionListener): ActionListenerObject;
    getMiddleware(): Middleware<{}, GameState>;
}

export interface PayloadActionListener<P = unknown> {
    (payload: P): void;
}

export interface ActionListenerObject {
    removeActionListener: () => void;
}

type ListenerMap = Map<string, Set<PayloadActionListener>>;

export const ActionManager = (): ActionManager => {

    const commonListenerMap: ListenerMap = new Map();

    const battleListenerMap: ListenerMap = new Map();

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
            };
        },

        getMiddleware() {
            return api => next => (action: PayloadAction<unknown>) => {

                const maps = getListenerMap();
console.log('action payload', action.payload)
                maps.forEach(map => {
                    map.get(action.type)?.forEach(fn => fn(action.payload));

                    if (action.type === 'app/reset') {
                        map.clear();
                    }
                });

                next(action);
            };
        }
    }
};
