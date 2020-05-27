import { PayloadAction } from '@reduxjs/toolkit';
import { StoreTest } from '../StoreTest';
import { ActionManager } from './ActionManager';
import { AppResetAction } from '../controller-actions';

describe('# ActionManager', () => {

    const getManager = () => {
        const manager = ActionManager();

        const middleware = manager.getMiddleware();

        const middlewareDispatch: (action: PayloadAction<any>) => void = middleware(null as any)(a => a);

        return {
            manager,
            middlewareDispatch
        };
    };

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should launch given listener on middleware dispatch', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener = jest.fn();

        manager.addActionListener('action/type', listener);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener).toHaveBeenNthCalledWith(1, { v: 6 });
    });

    it('should launch multiple listeners on middleware dispatch', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener1 = jest.fn();
        const listener2 = jest.fn();

        manager.addActionListener('action/type', listener1);
        manager.addActionListener('action/type', listener2);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener1).toHaveBeenNthCalledWith(1, { v: 6 });
        expect(listener2).toHaveBeenNthCalledWith(1, { v: 6 });
    });

    it('should do nothing on adding multiple times the same listener', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener = jest.fn();

        manager.addActionListener('action/type', listener);
        manager.addActionListener('action/type', listener);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener).toHaveBeenNthCalledWith(1, { v: 6 });
    });

    it('should do nothing on dispatch with no listener concerned', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener = jest.fn();

        manager.addActionListener('battle/notify-deaths', listener);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener).not.toHaveBeenCalled();
    });

    it('should remove listener on callback launch', () => {
        const { manager, middlewareDispatch } = getManager();

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        const listenerCb = manager.addActionListener('action/type', listener);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener).toHaveBeenCalled();

        listenerCb.removeActionListener();

        const nbCallsBefore = nbCalls;

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    it.skip('should call store dispatch on dispatch call', () => {

        // const storeDispatch = jest.fn();

        // const manager = ActionManager(storeDispatch);

        // manager.dispatch({
        //     type: 'action/type',
        //     stageKey: 'boot',
        //     payload: {}
        // });

        // expect(storeDispatch).toHaveBeenNthCalledWith(1, {
        //     type: 'action/type',
        //     stageKey: 'boot',
        //     payload: {}
        // });
    });

    it('should remove all listener on reset action', () => {
        const { manager, middlewareDispatch } = getManager();

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        manager.addActionListener('action/type', listener);

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(listener).toHaveBeenCalled();

        middlewareDispatch(AppResetAction());

        const nbCallsBefore = nbCalls;

        middlewareDispatch({
            type: 'action/type',
            payload: { v: 6 }
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    describe('on battle context', () => {

        it('should call common listener on dispatch', () => {
            const { manager, middlewareDispatch } = getManager();

            const listener = jest.fn();

            manager.addActionListener('action/type', listener);

            manager.beginBattleSession();

            middlewareDispatch({
                type: 'action/type',
                payload: { v: 6 }
            });

            expect(listener).toHaveBeenNthCalledWith(1, { v: 6 });
        });

        it('should call battle listeners on dispatch', () => {
            const { manager, middlewareDispatch } = getManager();

            const listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('action/type', listener);

            middlewareDispatch({
                type: 'action/type',
                payload: { v: 6 }
            });

            expect(listener).toHaveBeenNthCalledWith(1, { v: 6 });
        });

        it('should clear battle listeners on session end', () => {
            const { manager, middlewareDispatch } = getManager();

            let listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('action/type', () => listener());

            middlewareDispatch({
                type: 'action/type',
                payload: { v: 6 }
            });

            expect(listener).toHaveBeenCalledTimes(1);

            manager.endBattleSession();

            listener = jest.fn();

            middlewareDispatch({
                type: 'action/type',
                payload: { v: 6 }
            });

            expect(listener).not.toHaveBeenCalled();
        });

    });

});
