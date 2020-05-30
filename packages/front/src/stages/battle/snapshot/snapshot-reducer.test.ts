import { BattleSnapshot, getBattleSnapshotWithHash, TimerTester } from '@timeflies/shared';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { Team } from '../entities/team/Team';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';
import { BattleCommitAction } from './snapshot-manager-actions';
import { snapshotReducer, SnapshotState } from './snapshot-reducer';

describe('# snapshot-reducer', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should commit battle data future on commit action, then get the correct hash', () => {

        const teams: Team<any>[] = [
            {
                getSnapshot() {
                    return {
                        id: 't1',
                        color: 'red',
                        name: '',
                        playersSnapshots: []
                    }
                }
            } as unknown as Team<any>
        ];

        const initialState: SnapshotState = {
            launchTime: -1,
            snapshotList: [],
            battleDataCurrent: {
                battleHash: 'not-matter',
                teams,
                players: [],
                characters: []
            },
            battleDataFuture: {
                battleHash: 'not-matter',
                teams,
                players: [],
                characters: []
            }
        };

        const newState = snapshotReducer(initialState, BattleCommitAction({
            time: timerTester.now
        }));

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            time: timerTester.now,
            launchTime: -1,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const { battleHash } = getBattleSnapshotWithHash(partialSnap);

        expect(newState.battleDataFuture.battleHash).toBe(battleHash);
        expect(newState.battleDataCurrent.battleHash).toBe(battleHash);
    });

    describe('spell action actions:', () => {

        it('should rollback on spell action removed', () => {

            const updateFromSnapshot = jest.fn();

            let teamColor = 'red';

            const teams: Team<any>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: teamColor,
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot
                } as unknown as Team<any>
            ];

            const initialState: SnapshotState = {
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: []
                }
            };

            const state1 = snapshotReducer(initialState, BattleCommitAction({
                time: timerTester.now
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            teamColor = 'blue';

            const state2 = snapshotReducer(state1, BattleCommitAction({
                time: timerTester.now + 100
            }));

            const state3 = snapshotReducer(state2, SpellActionTimerEndAction({
                removed: true,
                correctHash: firstHash,
                spellActionSnapshot: {} as any
            }));

            expect(updateFromSnapshot).toHaveBeenCalledTimes(1);

            expect(state3.battleDataFuture.battleHash).toBe(firstHash);
        });

        it('should rollback on previous spell action removed and update current battle data', () => {

            const updateFromSnapshot = jest.fn();

            let teamColor = 'red';

            const teams: Team<any>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: teamColor,
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot
                } as unknown as Team<any>
            ];

            const initialState: SnapshotState = {
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: []
                }
            };

            const state1 = snapshotReducer(initialState, BattleCommitAction({
                time: timerTester.now
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            timerTester.advanceBy(100);

            teamColor = 'blue';

            const state2 = snapshotReducer(state1, BattleCommitAction({
                time: timerTester.now
            }));

            const state3 = snapshotReducer(state2, SpellActionTimerEndAction({
                removed: true,
                correctHash: firstHash,
                spellActionSnapshot: {} as any
            }));

            expect(state3.battleDataFuture.battleHash).toBe(firstHash);
            expect(state3.battleDataCurrent.battleHash).toBe(firstHash);
        });

        it('should update current battle data from future on spell action end action', () => {

            const currentTeams: Team<'current'>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot() { }
                } as unknown as Team<'current'>
            ];

            const futureTeams: Team<'future'>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot() { }
                } as unknown as Team<'future'>
            ];

            const initialState: SnapshotState = {
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams: currentTeams,
                    players: [],
                    characters: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams: futureTeams,
                    players: [],
                    characters: []
                }
            };

            const state1 = snapshotReducer(initialState, BattleCommitAction({
                time: timerTester.now
            }));

            const lastHash = state1.battleDataFuture.battleHash;

            const state2 = snapshotReducer(state1, SpellActionTimerEndAction({
                removed: false,
                correctHash: lastHash,
                spellActionSnapshot: {} as any
            }));

            expect(state2.battleDataCurrent.battleHash).toBe(lastHash);
        });
    });

    describe('turn actions:', () => {

        it('should commit on turn start with date now', () => {

            const teams: Team<any>[] = [
                {
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: []
                        }
                    }
                } as unknown as Team<any>
            ];

            const initialState: SnapshotState = {
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    teams,
                    players: [],
                    characters: []
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    teams,
                    players: [],
                    characters: []
                }
            };

            const state1 = snapshotReducer(initialState, BattleStateTurnStartAction({
                characterId: 'not-matter'
            }));

            expect(state1.battleDataFuture.battleHash).not.toBe('not-defined-future');
            expect(state1.battleDataCurrent.battleHash).not.toBe('not-defined-current');
        });

        it('should rollback to before now on turn end', () => {

            const currentTeams: Team<'current'>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot() { }
                } as unknown as Team<'current'>
            ];

            const futureTeams: Team<'future'>[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: []
                        }
                    },
                    updateFromSnapshot() { }
                } as unknown as Team<'future'>
            ];

            const initialState: SnapshotState = {
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    teams: currentTeams,
                    players: [],
                    characters: []
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    teams: futureTeams,
                    players: [],
                    characters: []
                }
            };

            const state1 = snapshotReducer(initialState, BattleCommitAction({
                time: timerTester.now - 100
            }));

            const pastHash = state1.battleDataFuture.battleHash;

            const state2 = snapshotReducer(state1, BattleCommitAction({
                time: timerTester.now + 100
            }));

            const state3 = snapshotReducer(state2, BattleCommitAction({
                time: timerTester.now + 200
            }));

            const state4 = snapshotReducer(state3, BattleStateTurnEndAction());

            expect(state4.battleDataFuture.battleHash).toBe(pastHash);
        });
    });
});
