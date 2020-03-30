import { StoreTest } from '../../../StoreTest';
import { MapManager } from './MapManager';
import { Position, TiledManager } from '@timeflies/shared';
import { seedMapManager } from './MapManager.seed';
import { Pathfinder } from './Pathfinder';
import { seedCharacter, seedCharacterInitialPosition } from '../entities/character/Character.seed';
import { TiledMapSeedKey, seedTiledMapAssets, seedTiledConfig } from './TiledMap.seed';

describe('# MapManager', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    const getManager = ({ mapKey, tiledManagerCreator, pathfinderCreator }: {
        mapKey: TiledMapSeedKey;
        tiledManagerCreator?: typeof TiledManager;
        pathfinderCreator?: typeof Pathfinder;
    }): MapManager => {

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        characters: [ seedCharacter('fake', { id: '1', player: null }) ]
                    }
                } as any
            }
        });

        return seedMapManager('real', mapKey,
            {
                tiledManagerCreator: tiledManagerCreator ?? (() => ({
                    width: -1,
                    height: -1,
                    orientation: 'orthogonal',
                    getTileType() { return null }
                } as any)),
                pathfinderCreator: pathfinderCreator ?? (() => ({
                    refreshGrid: () => { },
                    calculatePath: () => ({ promise: Promise.resolve([]), cancel: () => true })
                }))
            }
        );
    };

    it('should give to tiledManager assets and good config', () => {

        const tiledManagerCreator: typeof TiledManager = jest.fn(() => ({} as TiledManager));

        const manager = getManager({ mapKey: 'map_1', tiledManagerCreator });

        const assets = seedTiledMapAssets('map_1');

        const config = seedTiledConfig('map_1');

        expect(tiledManagerCreator).toHaveBeenNthCalledWith<Parameters<typeof TiledManager>>(1,
            assets, config);
    });

    it('should give to pathfinder characters positions getter', () => {

        expect.assertions(1);

        const pathfinderCreator: typeof Pathfinder = jest.fn((tiledManager, positionsGetter): Pathfinder => {
            expect(positionsGetter()).toEqual<Position[]>([ seedCharacterInitialPosition ]);
            return ({
                calculatePath: () => ({} as any),
                refreshGrid() { }
            });
        });

        const manager = getManager({ mapKey: 'map_1', pathfinderCreator });
    });

    it('should call pathfinder#refreshGrid on creation', () => {

        const refreshGrid = jest.fn();

        const manager = getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        expect(refreshGrid).toHaveBeenCalled();
    });

    it('should call pathfinder#refreshGrid on refreshPathfinder()', () => {

        const refreshGrid = jest.fn();

        const manager = getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        manager.refreshPathfinder();

        expect(refreshGrid).toHaveBeenCalledTimes(2);
    });

});
