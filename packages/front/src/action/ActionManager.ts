import { GameAction } from './GameAction';

export interface ActionManager {
    addActionListener(type: GameAction[ 'type' ], fn: ActionListener<GameAction>): ActionListenerObject;
    dispatch(action: GameAction): void;
}

export interface ActionListener<A extends GameAction> {
    (action: A): void;
}

export interface ActionListenerObject {
    removeActionListener: () => void;
}

export const ActionManager = (storeDispatcher: (action: GameAction) => void): ActionManager => {

    const listenerMap: Map<
        GameAction[ 'type' ],
        Set<ActionListener<GameAction>>
    > = new Map();

    return {

        addActionListener(type, fn) {
            const values = listenerMap.get(type) ?? new Set();
            values.add(fn);
            listenerMap.set(type, values);

            return {
                removeActionListener: () => {
                    values.delete(fn);
                }
            }
        },

        dispatch(action) {
            listenerMap.get(action.type)?.forEach(fn => fn(action));

            storeDispatcher(action);
        }
    }
};
