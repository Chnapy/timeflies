import { StoreTest } from '../StoreTest';
import { StageManager, Stage, StageChangeAction } from './StageManager';
import { Controller } from '../Controller';

describe('# StageManager', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should init with boot stage', async () => {

        const preload = jest.fn(() => Promise.resolve({}));
        const create = jest.fn();

        const bootFn = jest.fn((): Stage<'boot', never> => ({
            preload,
            create
        }));

        StageManager(
            {
                stageCreators: {
                    boot: bootFn,
                    battle: jest.fn(),
                    room: jest.fn()
                }
            });

        await Controller.loader.newInstance().load();

        expect(bootFn).toHaveBeenCalledTimes(1);
        expect(preload).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledTimes(1);
    });

    it('should change stage on action and load its assets', async () => {

        const bootFn = jest.fn((): Stage<'boot', never> => ({
            preload() { return Promise.resolve({}) },
            create() { return Promise.resolve(); }
        }));
        const create = jest.fn();
        const roomFn = jest.fn((): Stage<'room', any> => ({
            preload() {
                return Promise.resolve({
                    'test1': 'test1',
                    'test2': 'test2',
                });
            },
            create
        }));

        StageManager(
            {
                stageCreators: {
                    boot: bootFn,
                    room: roomFn,
                    battle: jest.fn()
                }
            });

        await Controller.loader.newInstance().load();

        StoreTest.dispatch<StageChangeAction<'room'>>({
            type: 'stage/change',
            stageKey: 'room',
            payload: { toto: 6 } as any
        });

        await Controller.loader.newInstance().load();

        expect(roomFn).toHaveBeenNthCalledWith(1, { toto: 6 });
        expect(create).toHaveBeenNthCalledWith(1, {
            // note: only keys should be checked here, value doesn't matter
            'test1': 'test1',
            'test2': 'test2',
        }, expect.anything());
    });

});
