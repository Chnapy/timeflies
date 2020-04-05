import { switchUtil } from '@timeflies/shared';
import { ReceiveMessageAction, SendMessageAction } from '../socket/WSClient';
import { BStateAction } from '../stages/battle/battleState/BattleStateSchema';
import { GameAction } from './GameAction';
import { serviceBattleData } from '../services/serviceBattleData';

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

    const logger = ActionLogger();

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

            logger.log(action);

            listenerMap.get(action.type)?.forEach(fn => fn(action));

            if (action.type === 'app/reset') {
                listenerMap.clear();
            }

            storeDispatcher(action);
        }
    }
};

const ActionLogger = () => {

    const blackStyle = 'color: #444;font-weight:bold;';
    const greyStyle = 'color: #888;';
    const actionPre = '%caction %c';
    const separator = '%c > %c';

    const getLog = (action: GameAction, subType?: string): string[] => {
        if (subType) {
            return [
                actionPre + action.type + separator + subType,
                greyStyle, blackStyle, greyStyle, blackStyle
            ];
        }
        return [ actionPre + action.type, greyStyle, blackStyle ];
    };

    return {
        log(action: GameAction) {

            const getLogTitle: () => string[] = switchUtil(action.type as Extract<GameAction,
                | BStateAction
                | SendMessageAction
                | ReceiveMessageAction
            >[ 'type' ], {
                'battle/state/event': () => getLog(action, (action as BStateAction).eventType),
                'message/send': () => getLog(action, (action as SendMessageAction).message.type),
                'message/receive': () => getLog(action, (action as ReceiveMessageAction).message.type)
            })
                ?? (() => getLog(action));

            console.groupCollapsed(...getLogTitle());
            console.log('%caction', 'color: #5AF;font-weight:bold;', action);
            try {
                console.log('%cbattleData (past)', 'color: #5F5;font-weight:bold;', {
                    cycle: serviceBattleData('cycle'),
                    current: serviceBattleData('current'),
                    future: serviceBattleData('future')
                });
            } catch (e) { }
            console.groupEnd();
        }
    };
};
