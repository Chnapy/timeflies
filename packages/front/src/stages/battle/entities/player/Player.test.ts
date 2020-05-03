import { StoreTest } from '../../../../StoreTest';
import { PlayerSnapshot } from '@timeflies/shared';
import { seedPlayer, seedPlayerSnapshot } from './Player.seed';

describe('# Player', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should return correct snapshot', () => {

        StoreTest.initStore({
            currentPlayer: {
                id: 'p1',
                name: 'p-1'
            }
        });

        const expectedSnapshot = seedPlayerSnapshot({
            id: 'p1',
            name: 'p-1',
            seedCharacters: [ {
                id: 'c-1',
                seedSpells: [ { id: 's1', type: 'move' } ]
            } ],
        });

        const player = seedPlayer('real', {
            period: 'current',
            id: 'p1',
            name: 'p-1',
            seedCharacters: [ {
                id: 'c-1',
                seedSpells: [ { id: 's1', type: 'move' } ]
            } ],
            team: null,
            dependencies: {
                characterCreator: (period, snap) => ({
                    getSnapshot() {
                        return snap;
                    },
                } as any)
            }
        });

        expect(player.getSnapshot()).toEqual<PlayerSnapshot>(expectedSnapshot);
    });

    it('should update from snapshot correctly', () => {

        StoreTest.initStore({
            currentPlayer: {
                id: 'p1',
                name: 'p-1'
            }
        });

        const updateFromSnapshot = jest.fn();

        const player = seedPlayer('real', {
            period: 'current',
            id: 'p1',
            name: 'p-1',
            seedCharacters: [ {
                id: 'c-1',
                seedSpells: [ { id: 's1', type: 'move' } ]
            } ],
            team: null,
            dependencies: {
                characterCreator: (period, snap) => ({
                    id: snap.staticData.id,
                    updateFromSnapshot
                } as any)
            }
        });

        const newSnapshot = seedPlayerSnapshot({
            id: 'p1',
            name: 'p-1',
            seedCharacters: [ {
                id: 'c-1',
                seedSpells: [ { id: 's1', type: 'move' } ]
            } ],
        });

        player.updateFromSnapshot(newSnapshot);

        expect(updateFromSnapshot).toHaveBeenCalledTimes(1);
    });
});
