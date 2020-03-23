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

        const preload = jest.fn(() => ({}));
        const create = jest.fn();

        const bootFn = jest.fn((): Stage<never> => ({
            graphic: { getContainer() { return null as any } },
            preload,
            create
        }));

        const manager = StageManager(
            {
                stageCreators: {
                    boot: bootFn,
                    load: jest.fn(),
                    battle: jest.fn()
                }
            });

        await Controller.loader.newInstance().load();

        expect(bootFn).toHaveBeenCalledTimes(1);
        expect(preload).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledTimes(1);
    });

    it('should change stage on action and load its assets', async () => {

        const bootFn = jest.fn((): Stage<never> => ({
            graphic: { getContainer() { return null as any } },
            preload() { return {} },
            create() { }
        }));
        const create = jest.fn();
        const loadFn = jest.fn((): Stage<never> => ({
            graphic: { getContainer() { return null as any } },
            preload() {
                return {
                    'test1': 'test1',
                    'test2': 'test2',
                };
            },
            create
        }));

        const manager = StageManager(
            {
                stageCreators: {
                    boot: bootFn,
                    load: loadFn,
                    battle: jest.fn()
                }
            });

        await Controller.loader.newInstance().load();

        StoreTest.dispatch<StageChangeAction<'load'>>({
            type: 'stage/change',
            stageKey: 'load',
            payload: { toto: 6 } as any
        });

        await Controller.loader.newInstance().load();

        expect(loadFn).toHaveBeenNthCalledWith(1, { toto: 6 });
        expect(create).toHaveBeenNthCalledWith(1, {
            // note: only keys should be checked here, value doesn't matter
            'test1': 'test1',
            'test2': 'test2',
        });
    });

});
