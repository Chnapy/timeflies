import { StoreTest } from '../../../StoreTest';
import { Player } from './Player';
import { PlayerSnapshot, PlayerState } from '@timeflies/shared';

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
            },
            data: null as any
        });

        const player = Player(
            {
                id: 'p1',
                name: 'p-1',
                state: 'battle-run',
                charactersSnapshots: [ {
                    staticData: {
                        id: 'c-1'
                    }
                } as any ]
            },
            {} as any,
            {
                characterCreator: snap => ({
                    getSnapshot() {
                        return snap;
                    },
                } as any)
            }
        );

        expect(player.getSnapshot()).toEqual<PlayerSnapshot>({
            id: 'p1',
            name: 'p-1',
            state: 'battle-run',
            charactersSnapshots: [ {
                staticData: {
                    id: 'c-1'
                }
            } as any ]
        });
    });

    it('should update from snapshot correctly', () => {

        StoreTest.initStore({
            currentPlayer: {
                id: 'p1',
                name: 'p-1'
            },
            data: null as any
        });

        const updateFromSnapshot = jest.fn();

        const player = Player(
            {
                id: 'p1',
                name: 'p-1',
                state: 'battle-run',
                charactersSnapshots: [ {
                    staticData: {
                        id: 'c-1'
                    }
                } as any ]
            },
            {} as any,
            {
                characterCreator: snap => ({
                    id: snap.staticData.id,
                    updateFromSnapshot
                } as any)
            }
        );

        player.updateFromSnapshot({
            id: 'p1',
            name: 'p-1',
            state: 'battle-ready',
            charactersSnapshots: [ {
                staticData: {
                    id: 'c-1'
                }
            } as any ]
        });

        expect(player.state).toBe<PlayerState>('battle-ready');
        expect(updateFromSnapshot).toHaveBeenCalledTimes(1);
    });
});
