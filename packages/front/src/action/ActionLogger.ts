import { GameAction } from './GameAction';
import { switchUtil } from '@timeflies/shared';
import { BStateAction } from '../stages/battle/battleState/BattleStateSchema';
import { SendMessageAction, ReceiveMessageAction } from '../socket/WSClient';
import { serviceBattleData } from '../services/serviceBattleData';

export const ActionLogger = () => {

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
