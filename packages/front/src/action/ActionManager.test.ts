import { ActionManager } from './ActionManager';

describe('# ActionManager', () => {

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

});
