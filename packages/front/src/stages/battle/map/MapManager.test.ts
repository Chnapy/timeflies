import { Position, TiledManager, TiledMapSeedKey, TimerTester } from '@timeflies/shared';
import { StoreTest } from '../../../StoreTest';
import { seedCharacter, seedCharacterInitialPosition } from '../entities/character/Character.seed';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionTimerEndAction } from '../spellAction/SpellActionTimer';
import { MapManager } from './MapManager';
import { seedMapManager } from './MapManager.seed';
import { Pathfinder } from './Pathfinder';
import { seedTiledMapAssetsWithImg } from './TiledMap.seed';

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
            battle: {
                future: {
                    characters: charactersFuture
                }
            } as any
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

        getManager({ mapKey: 'map_1', tiledManagerCreator });

        const assets = seedTiledMapAssetsWithImg('map_1');

        expect(tiledManagerCreator).toHaveBeenNthCalledWith<Parameters<typeof TiledManager>>(1,
            assets);
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

        getManager({ mapKey: 'map_1', pathfinderCreator });
    });

    it('should refresh pathfinder on creation', () => {

        const refreshGrid = jest.fn();

        getManager({
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

    it('should refresh pathfinder on commit action', () => {

        let nbrCalls = 0;

        const refreshGrid = jest.fn(() => nbrCalls++);

        getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        const prevNbrCalls = nbrCalls;

        StoreTest.dispatch<BattleCommitAction>({
            type: 'battle/commit',
            time: Date.now()
        });

        expect(nbrCalls).toBe(prevNbrCalls + 1);

    });

    it('should refresh pathfinder on spell cancel', () => {

        let nbrCalls = 0;

        const refreshGrid = jest.fn(() => nbrCalls++);

        getManager({
            mapKey: 'map_1',
            pathfinderCreator: () => ({
                refreshGrid
            } as any)
        });

        const prevNbrCalls = nbrCalls;

        StoreTest.dispatch<SpellActionTimerEndAction>({
            type: 'battle/spell-action/end',
            correctHash: '',
            removed: true,
            spellActionSnapshot: {} as any
        });

        jest.runAllImmediates();

        expect(nbrCalls).toBe(prevNbrCalls + 1);

    });

});
