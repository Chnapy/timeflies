import { CanvasContext } from './CanvasContext';
import { seedMapManager } from '../stages/battle/map/MapManager.seed';
import { ActionManager } from '../action/ActionManager';

describe('# CanvasContext', () => {

    it('should throw error on consumer use out of provider', () => {

        expect(() => CanvasContext.consumer('mapManager')).toThrowError();

        CanvasContext.provider({ mapManager: seedMapManager() }, jest.fn());

        expect(() => CanvasContext.consumer('mapManager')).toThrowError();
    });

    it('should return expected context on consumer use in provider', () => {

        const mapManager = seedMapManager();

        const ret = CanvasContext.provider({ mapManager }, () =>
            CanvasContext.consumer('mapManager')
        );

        expect(ret).toEqual({ mapManager });
    });

    it('should handle multiple providers', () => {

        const mapManager = seedMapManager();
        const actionManager: ActionManager = {} as any;

        const ret = CanvasContext.provider({ mapManager }, () => {

            return CanvasContext.provider({ actionManager }, () => {

                return CanvasContext.consumer('mapManager', 'actionManager');
            });

        });

        expect(ret).toEqual({ mapManager, actionManager });
    });

});
