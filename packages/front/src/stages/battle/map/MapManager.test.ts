import { StoreTest } from '../../../StoreTest';
import { MapManager } from './MapManager';
import { Position, TiledManager, TimerTester } from '@timeflies/shared';
import { seedMapManager } from './MapManager.seed';
import { Pathfinder } from './Pathfinder';
import { seedCharacter, seedCharacterInitialPosition } from '../entities/character/Character.seed';
import { TiledMapSeedKey, seedTiledMapAssets, seedTiledConfig } from './TiledMap.seed';
import { BStateAction } from '../battleState/BattleStateSchema';

describe('# MapManager', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    const getManager = ({ mapKey, tiledManagerCreator, pathfinderCreator }: {
        mapKey: TiledMapSeedKey;
        tiledManagerCreator?: typeof TiledManager;
        pathfinderCreator?: typeof Pathfinder;
    }): MapManager => {

        const charactersFuture = [ seedCharacter('fake', { period: 'future', id: '1', player: null }) ];

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        characters: charactersFuture
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
                })),
                getFutureCharacters: () => charactersFuture
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

    it('should refresh pathfinder on creation', () => {

        const refreshGrid = jest.fn();

        const manager = getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        expect(refreshGrid).toHaveBeenCalled();
    });

    it('should refresh pathfinder on refreshPathfinder()', () => {

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

    it('should refresh pathfinder on spell launch action', () => {

        let nbrCalls = 0;

        const refreshGrid = jest.fn(() => nbrCalls++);

        const manager = getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        const prevNbrCalls = nbrCalls;

        StoreTest.dispatch<BStateAction>({
            type: 'battle/state/event',
            eventType: 'SPELL-LAUNCH',
            payload: {
                spellActions: []
            }
        });

        expect(nbrCalls).toBe(prevNbrCalls);

        timerTester.immediates.runAll();

        expect(nbrCalls).toBe(prevNbrCalls + 1);

    });

});
