import { StoreTest } from '../../../StoreTest';
import { SnapshotManager, BattleCommitAction } from './SnapshotManager';
import { Team } from '../entities/Team';
import { BattleSnapshot, generateObjectHash, ConfirmSAction } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../socket/WSClient';

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
                        players: null as any,
                        spellActionSnapshotList: []
                    }
                }
            }
        });

        const manager = SnapshotManager();

        StoreTest.dispatch<BattleCommitAction>({ type: 'battle/commit' });

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            launchTime: -1,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const battleHash = generateObjectHash(partialSnap);

        expect(manager.getLastHash()).toBe(battleHash);
    });

    it('should rollback on action from given hash', () => {

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
                        players: null as any,
                        spellActionSnapshotList: []
                    }
                }
            }
        });

        const manager = SnapshotManager();

        StoreTest.dispatch<BattleCommitAction>({ type: 'battle/commit' });

        const firstHash = manager.getLastHash();

        teams.push(
            {
                getSnapshot() {
                    return {
                        id: 't2',
                        color: 'blue',
                        name: '',
                        playersSnapshots: []
                    }
                }
            } as unknown as Team);

        StoreTest.dispatch<BattleCommitAction>({ type: 'battle/commit' });

        StoreTest.dispatch<ReceiveMessageAction<ConfirmSAction>>({
            type: 'message/receive',
            message: {
                type: 'confirm',
                sendTime: Date.now(),
                isOk: false,
                lastCorrectHash: firstHash
            }
        });

        expect(manager.getLastHash()).toBe(firstHash);
    });
});
