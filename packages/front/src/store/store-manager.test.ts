import { createStoreManager } from './store-manager';
import { createAssetLoader } from '../assetManager/AssetLoader';
import { GameState } from '../game-state';
import { BatchActions } from './batch-middleware';

describe('# store-manager', () => {

    const getManager = () => createStoreManager({
        assetLoader: createAssetLoader()
    });

    it('should init with correct state structure', () => {

        const manager = getManager();

        expect(manager.getState()).toEqual(expect.objectContaining<GameState>({
            step: expect.any(String),
            currentPlayer: expect.any(Object),
            room: expect.any(Object),
            battle: expect.any(Object)
        }));
    });

    describe('check middlewares pipeline', () => {

        it('should return promise on any action', async () => {

            const manager = getManager();

            const ret = manager.dispatch({ type: 'random-action' });

            expect(ret instanceof Promise).toBe(true);

            await ret;
        });

        it('should return promise on batch action', async () => {

            const manager = getManager();

            const ret = manager.dispatch(BatchActions([
                { type: 'first-action' },
                { type: 'second-action' },
            ]));

            expect(ret instanceof Promise).toBe(true);

            await ret;
        });
    });

    describe('check subscribers updates', () => {

        it('should update once each subscribers after dispatch', async () => {

            const manager = getManager();

            const { subscribe } = manager.store;

            const fn1 = jest.fn();
            const fn2 = jest.fn();

            subscribe(fn1);
            subscribe(fn2);

            await manager.dispatch({ type: 'random-action' });

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledTimes(1);
        });

        it('should update once each subscribers after batch action dispatch', async () => {

            const manager = getManager();

            const { subscribe } = manager.store;

            const fn1 = jest.fn();
            const fn2 = jest.fn();

            subscribe(fn1);
            subscribe(fn2);

            await manager.dispatch(BatchActions([
                { type: 'first-action' },
                { type: 'second-action' },
            ]));

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledTimes(1);
        });
    });
});
