import { StoreTest } from '../../../StoreTest';
import { SnapshotManager, BattleCommitAction } from './SnapshotManager';
import { Team } from '../entities/Team';
import { BattleSnapshot, generateObjectHash } from '@timeflies/shared';

describe('# SnapshotManager', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should commit battle data (future) on action, then get the correct hash', () => {

        const teams: Team[] = [
            {
                getSnapshot() {
                    return {
                        id: 't1',
                        color: 'red',
                        name: '',
                        playersSnapshots: []
                    }
                }
            } as unknown as Team
        ];

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    cycle: {
                        launchTime: -1
                    },
                    current: null as any,
                    future: {
                        teams,
                        characters: null as any,
                        players: null as any
                    }
                }
            }
        });

        const manager = SnapshotManager();

        StoreTest.dispatch<BattleCommitAction>({ type: 'battle/commit' });

        const partialSnap: Omit<BattleSnapshot, 'hash'> = {
            launchTime: -1,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const battleHash = generateObjectHash(partialSnap);

        expect(manager.getLastHash()).toBe(battleHash);
    });

    it.todo('should rollback from given hash');
});
