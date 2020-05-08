import { StoreTest } from '../StoreTest';
import { ActionManager } from './ActionManager';

describe('# ActionManager', () => {

    const getManager = () => {
        const manager = ActionManager();

        const middleware = manager.getMiddleware();

        const middlewareDispatch = middleware(null as any)(a => a);

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

        manager.addActionListener('stage/change', listener);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenNthCalledWith(1, {
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });
    });

    it('should launch multiple listeners on middleware dispatch', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener1 = jest.fn();
        const listener2 = jest.fn();

        manager.addActionListener('stage/change', listener1);
        manager.addActionListener('stage/change', listener2);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener1).toHaveBeenNthCalledWith(1, {
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });
        expect(listener2).toHaveBeenNthCalledWith(1, {
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });
    });

    it('should do nothing on adding multiple times the same listener', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener = jest.fn();

        manager.addActionListener('stage/change', listener);
        manager.addActionListener('stage/change', listener);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenNthCalledWith(1, {
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });
    });

    it('should do nothing on dispatch with no listener concerned', () => {
        const { manager, middlewareDispatch } = getManager();

        const listener = jest.fn();

        manager.addActionListener('battle/notify-deaths', listener);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).not.toHaveBeenCalled();
    });

    it('should remove listener on callback launch', () => {
        const { manager, middlewareDispatch } = getManager();

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        const listenerCb = manager.addActionListener('stage/change', listener);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenCalled();

        listenerCb.removeActionListener();

        const nbCallsBefore = nbCalls;

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    it.skip('should call store dispatch on dispatch call', () => {

        // const storeDispatch = jest.fn();

        // const manager = ActionManager(storeDispatch);

        // manager.dispatch({
        //     type: 'stage/change',
        //     stageKey: 'boot',
        //     payload: {}
        // });

        // expect(storeDispatch).toHaveBeenNthCalledWith(1, {
        //     type: 'stage/change',
        //     stageKey: 'boot',
        //     payload: {}
        // });
    });

    it('should remove all listener on reset action', () => {
        const { manager, middlewareDispatch } = getManager();

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        manager.addActionListener('stage/change', listener);

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenCalled();

        middlewareDispatch({
            type: 'app/reset'
        });

        const nbCallsBefore = nbCalls;

        middlewareDispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    describe('on battle context', () => {

        it('should call common listener on dispatch', () => {
            const { manager, middlewareDispatch } = getManager();

            const listener = jest.fn();

            manager.addActionListener('stage/change', listener);

            manager.beginBattleSession();

            middlewareDispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).toHaveBeenNthCalledWith(1, {
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });
        });

        it('should call battle listeners on dispatch', () => {
            const { manager, middlewareDispatch } = getManager();

            const listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('stage/change', listener);

            middlewareDispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).toHaveBeenNthCalledWith(1, {
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });
        });

        it('should clear battle listeners on session end', () => {
            const { manager, middlewareDispatch } = getManager();

            let listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('stage/change', () => listener());

            middlewareDispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).toHaveBeenCalledTimes(1);

            manager.endBattleSession();

            listener = jest.fn();

            middlewareDispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).not.toHaveBeenCalled();
        });

    });

});
