import { StoreTest } from '../StoreTest';
import { ActionManager } from './ActionManager';

describe('# ActionManager', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should launch given listener on dispatch', () => {
        const manager = ActionManager(() => { });

        const listener = jest.fn();

        manager.addActionListener('stage/change', listener);

        manager.dispatch({
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

    it('should launch multiple listeners on dispatch', () => {
        const manager = ActionManager(() => { });

        const listener1 = jest.fn();
        const listener2 = jest.fn();

        manager.addActionListener('stage/change', listener1);
        manager.addActionListener('stage/change', listener2);

        manager.dispatch({
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
        const manager = ActionManager(() => { });

        const listener = jest.fn();

        manager.addActionListener('stage/change', listener);
        manager.addActionListener('stage/change', listener);

        manager.dispatch({
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
        const manager = ActionManager(() => { });

        const listener = jest.fn();

        manager.addActionListener('battle/notify-deaths', listener);

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).not.toHaveBeenCalled();
    });

    it('should remove listener on callback launch', () => {
        const manager = ActionManager(() => { });

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        const listenerCb = manager.addActionListener('stage/change', listener);

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenCalled();

        listenerCb.removeActionListener();

        const nbCallsBefore = nbCalls;

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    it('should call store dispatch on dispatch call', () => {

        const storeDispatch = jest.fn();

        const manager = ActionManager(storeDispatch);

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(storeDispatch).toHaveBeenNthCalledWith(1, {
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });
    });

    it('should remove all listener on reset action', () => {
        const manager = ActionManager(() => { });

        let nbCalls = 0;

        const listener = jest.fn(() => nbCalls++);

        manager.addActionListener('stage/change', listener);

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(listener).toHaveBeenCalled();

        manager.dispatch({
            type: 'app/reset'
        });

        const nbCallsBefore = nbCalls;

        manager.dispatch({
            type: 'stage/change',
            stageKey: 'boot',
            payload: {}
        });

        expect(nbCalls).toBe(nbCallsBefore);
    });

    describe('on battle context', () => {

        it('should call common listener on dispatch', () => {
            const manager = ActionManager(() => { });

            const listener = jest.fn();

            manager.addActionListener('stage/change', listener);

            manager.beginBattleSession();

            manager.dispatch({
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
            const manager = ActionManager(() => { });

            const listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('stage/change', listener);

            manager.dispatch({
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
            const manager = ActionManager(() => { });

            let listener = jest.fn();

            manager.beginBattleSession();

            manager.addActionListener('stage/change', () => listener());

            manager.dispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).toHaveBeenCalledTimes(1);

            manager.endBattleSession();

            listener = jest.fn();

            manager.dispatch({
                type: 'stage/change',
                stageKey: 'boot',
                payload: {}
            });

            expect(listener).not.toHaveBeenCalled();
        });

    });

});
