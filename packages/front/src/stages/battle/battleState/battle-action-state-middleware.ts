import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { battleStateActionList } from './battle-state-actions';
import { BState } from './BattleStateSchema';
import { switchUtil } from '@timeflies/shared';

type Dependencies = {
    extractBattleAction: <S>(getState: () => S) => BState;
};

export const battleActionStateMiddleware: (deps: Dependencies) => Middleware = ({
    extractBattleAction
}) => api => next => {

    return (action: AnyAction) => {
        next(action);

        if (battleStateActionList.some(ac => ac.match(action))) {
            const battleAction = extractBattleAction(api.getState);

            // switchUtil(battleAction, {

            // });
        }
    };
};
