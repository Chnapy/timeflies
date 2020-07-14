import { createStore, applyMiddleware } from '@reduxjs/toolkit';
import { rootReducer } from '../root-reducer';
import { getBattleMiddlewareList } from './battle-middleware-list';

describe('# battle-middleware-list', () => {

    it('should handle random action without blocking', async () => {

        const reducer = jest.fn(rootReducer);

        const store = createStore(reducer, applyMiddleware(...getBattleMiddlewareList()));

        await store.dispatch({ type: 'any' });

        expect(reducer).toHaveBeenCalledWith(expect.anything(), { type: 'any' });
    });

});
