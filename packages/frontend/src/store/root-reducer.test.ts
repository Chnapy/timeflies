import { createStore } from 'redux';
import { batchActions } from 'redux-batched-actions';
import { CredentialsLoginAction } from '../login-page/store/credentials-actions';
import { GameState } from './game-state';
import { rootReducer } from './root-reducer';

describe('root reducer', () => {

    it('handle batched actions', () => {

        const listener = jest.fn();

        const store = createStore(rootReducer);

        store.subscribe(listener);

        store.dispatch(
            batchActions([
                CredentialsLoginAction({
                    playerId: 'p1',
                    playerName: 'p-1',
                    token: 'foo'
                }),
                CredentialsLoginAction(null),
                CredentialsLoginAction({
                    playerId: 'p2',
                    playerName: 'p-2',
                    token: 'bar'
                }),
            ])
        );

        expect(listener).toHaveBeenCalledTimes(1);

        expect(store.getState()).toMatchObject<Partial<GameState>>({
            credentials: {
                playerId: 'p2',
                playerName: 'p-2',
                token: 'bar'
            }
        });
    });
});
