import { StoreTest } from '../StoreTest';
import { CanvasContext } from './CanvasContext';

describe('# CanvasContext', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should throw error on consumer use out of provider', () => {

        expect(() => CanvasContext.consumer('spritesheets')).toThrowError();

        CanvasContext.provider({ spritesheets: {} as any }, jest.fn());

        expect(() => CanvasContext.consumer('spritesheets')).toThrowError();
    });

    it('should return expected context on consumer use in provider', () => {

        const ret = CanvasContext.provider({ spritesheets: {} as any }, () =>
            CanvasContext.consumer('spritesheets')
        );

        expect(ret).toEqual({ spritesheets: {} });
    });

    it('should handle multiple providers', () => {

        const ret = CanvasContext.provider({ spritesheets: { toto: 8 } as any }, () => {

            return CanvasContext.provider({ assetLoader: { tata: 6 } as any }, () => {

                return CanvasContext.consumer('spritesheets', 'assetLoader');
            });

        });

        expect(ret).toEqual({
            spritesheets: { toto: 8 },
            assetLoader: { tata: 6 }
        });
    });
});
