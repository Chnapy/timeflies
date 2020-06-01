import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';
import { SnapshotState } from './snapshot-reducer';
import { NotifyDeathsAction } from '../cycle/cycle-manager-actions';

type Dependencies<S> = {
    extractState: (getState: () => S) => SnapshotState;
};

export const snapshotMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    extractState
}) => api => next => {

    return (action: AnyAction) => {

        if (SpellActionTimerEndAction.match(action)) {

            const serializeDeaths = () => extractState(api.getState).battleDataCurrent.characters
                .filter(c => !c.isAlive)
                .map(c => c.id).join('.');

            const serializedDeathsBefore = serializeDeaths();

            next(action);

            const serializedDeathsAfter = serializeDeaths();

            if (serializedDeathsBefore !== serializedDeathsAfter) {
                api.dispatch(NotifyDeathsAction());
            }
        } else {
            next(action);
        }
    };
};
