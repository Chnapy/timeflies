import { StoreTest } from '../../../StoreTest';
import { SnapshotManager, BattleCommitAction } from './SnapshotManager';
import { Team } from '../entities/Team';
import { BattleSnapshot, getBattleSnapshotWithHash, TimerTester, TeamSnapshot } from '@timeflies/shared';
import { SpellActionTimerEndAction } from '../spellAction/SpellActionTimer';
import { BattleDataCurrent, BattleDataFuture } from '../../../BattleData';
import { BStateTurnEndAction, BStateTurnStartAction } from '../battleState/BattleStateSchema';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { NotifyDeathsAction } from '../cycle/CycleManager';

describe('# SnapshotManager', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
        StoreTest.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
        StoreTest.afterTest();
    });

    it('should commit battle data future on commit action, then get the correct hash', () => {

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

        const currentBattleData: BattleDataCurrent = {
            battleHash: 'not-matter',
            teams,
            characters: null as any,
            players: null as any,
        };

        const futureBattleData: BattleDataFuture = {
            battleHash: 'not-matter',
            teams,
            characters: null as any,
            players: null as any,
            spellActionSnapshotList: []
        };

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    cycle: {
                        launchTime: -1
                    },
                    current: currentBattleData,
                    future: futureBattleData
                }
            }
        });

        const manager = SnapshotManager();

        StoreTest.dispatch<BattleCommitAction>({
            type: 'battle/commit',
            time: timerTester.now
        });

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            time: timerTester.now,
            launchTime: -1,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const { battleHash } = getBattleSnapshotWithHash(partialSnap);

        expect(futureBattleData.battleHash).toBe(battleHash);
        expect(currentBattleData.battleHash).toBe(battleHash);
    });

    describe('spell action actions:', () => {

        it('should rollback on spell action removed', () => {

            const updateFromSnapshot = jest.fn();

            let teamColor = 'red';

            const teams: Team[] = [
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
                } as unknown as Team
            ];

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-matter',
                teams,
                characters: null as any,
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-matter',
                teams,
                characters: null as any,
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            const firstHash = futureBattleData.battleHash;

            teamColor = 'blue';

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now + 100
            });

            StoreTest.dispatch<SpellActionTimerEndAction>({
                type: 'battle/spell-action/end',
                removed: true,
                correctHash: firstHash
            });

            expect(updateFromSnapshot).toHaveBeenCalledTimes(1);

            expect(futureBattleData.battleHash).toBe(firstHash);
        });

        it('should rollback on previous spell action removed and update current battle data', () => {

            const updateFromSnapshot = jest.fn();

            let teamColor = 'red';

            const teams: Team[] = [
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
                } as unknown as Team
            ];

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-matter',
                teams,
                characters: null as any,
                players: null as any
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-matter',
                teams,
                characters: null as any,
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            const firstHash = futureBattleData.battleHash;

            timerTester.advanceBy(100);

            teamColor = 'blue';

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            StoreTest.dispatch<SpellActionTimerEndAction>({
                type: 'battle/spell-action/end',
                removed: true,
                correctHash: firstHash
            });

            expect(futureBattleData.battleHash).toBe(firstHash);
            expect(currentBattleData.battleHash).toBe(firstHash);
        });

        it('should update current battle data from future on spell action end action', () => {

            const currentTeams: Team[] = [
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
                } as unknown as Team
            ];

            const futureTeams: Team[] = [
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
                } as unknown as Team
            ];

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-matter',
                teams: currentTeams,
                characters: [],
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-matter',
                teams: futureTeams,
                characters: [],
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            const lastHash = futureBattleData.battleHash;

            StoreTest.dispatch<SpellActionTimerEndAction>({
                type: 'battle/spell-action/end',
                removed: false,
                correctHash: lastHash
            });

            expect(currentBattleData.battleHash).toBe(lastHash);
        });

        it('should not notify for deaths on spell action end action if there is not new deaths', () => {

            const currentTeams: Team[] = [
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
                } as unknown as Team
            ];

            const futureTeams: Team[] = [
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
                } as unknown as Team
            ];

            const currentCharacter = seedCharacter();

            const futureCharacter = seedCharacter();

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-matter',
                teams: currentTeams,
                characters: [ currentCharacter ],
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-matter',
                teams: futureTeams,
                characters: [ futureCharacter ],
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            const lastHash = futureBattleData.battleHash;

            StoreTest.dispatch<SpellActionTimerEndAction>({
                type: 'battle/spell-action/end',
                removed: false,
                correctHash: lastHash
            });

            expect(StoreTest.getActions()).not.toContainEqual<NotifyDeathsAction>({
                type: 'battle/notify-deaths'
            });
        });

        it('should notify for deaths on spell action end action if there is new deaths', () => {

            const currentCharacter = seedCharacter();
            (currentCharacter as any)._ = 'CURRENT';

            const futureCharacter = seedCharacter();
            (futureCharacter as any)._ = 'FUTURE';

            const currentTeams: Team[] = [
                {
                    id: 't1',
                    getSnapshot() {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: [ {
                                id: 'p1',
                                name: 'p-1',
                                state: 'battle-run',
                                charactersSnapshots: [ currentCharacter.getSnapshot() ]
                            } ]
                        }
                    },
                    updateFromSnapshot(snapshot: TeamSnapshot) {
                        const [ characterSnapshot ] = snapshot.playersSnapshots[ 0 ].charactersSnapshots;
                        (currentCharacter.features.life as number) = characterSnapshot.features.life;
                    }
                } as unknown as Team
            ];

            const futureTeams: Team[] = [
                {
                    id: 't1',
                    getSnapshot(): TeamSnapshot {
                        return {
                            id: 't1',
                            color: 'red',
                            name: '',
                            playersSnapshots: [ {
                                id: 'p1',
                                name: 'p-1',
                                state: 'battle-run',
                                charactersSnapshots: [ futureCharacter.getSnapshot() ]
                            } ]
                        }
                    },
                    updateFromSnapshot(snapshot: TeamSnapshot) {
                        const [ characterSnapshot ] = snapshot.playersSnapshots[ 0 ].charactersSnapshots;
                        (futureCharacter.features.life as number) = characterSnapshot.features.life;
                    }
                } as unknown as Team
            ];

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-matter',
                teams: currentTeams,
                characters: [ currentCharacter ],
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-matter',
                teams: futureTeams,
                characters: [ futureCharacter ],
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            (futureCharacter.features.life as number) = 0;

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now
            });

            const lastHash = futureBattleData.battleHash;

            StoreTest.dispatch<SpellActionTimerEndAction>({
                type: 'battle/spell-action/end',
                removed: false,
                correctHash: lastHash
            });

            expect(StoreTest.getActions()).toContainEqual<NotifyDeathsAction>({
                type: 'battle/notify-deaths'
            });
        });
    });

    describe('turn actions:', () => {

        it('should commit on turn start with date now', () => {

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

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-defined',
                teams,
                characters: null as any,
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-defined',
                teams,
                characters: null as any,
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            expect(futureBattleData.battleHash).toBe('not-defined');

            StoreTest.dispatch<BStateTurnStartAction>({
                type: 'battle/state/event',
                eventType: 'TURN-START',
                payload: {
                    characterId: 'not-matter'
                }
            });

            expect(futureBattleData.battleHash).not.toBe('not-defined');
            expect(currentBattleData.battleHash).not.toBe('not-defined');
        });

        it('should rollback to before now on turn end', () => {

            const currentTeams: Team[] = [
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
                } as unknown as Team
            ];

            const futureTeams: Team[] = [
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
                } as unknown as Team
            ];

            const currentBattleData: BattleDataCurrent = {
                battleHash: 'not-defined',
                teams: currentTeams,
                characters: null as any,
                players: null as any,
            };

            const futureBattleData: BattleDataFuture = {
                battleHash: 'not-defined',
                teams: futureTeams,
                characters: null as any,
                players: null as any,
                spellActionSnapshotList: []
            };

            StoreTest.initStore({
                data: {
                    state: 'battle',
                    battleData: {
                        cycle: {
                            launchTime: -1
                        },
                        current: currentBattleData,
                        future: futureBattleData
                    }
                }
            });

            const manager = SnapshotManager();

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now - 100
            });

            const pastHash = futureBattleData.battleHash;

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now + 100
            });

            StoreTest.dispatch<BattleCommitAction>({
                type: 'battle/commit',
                time: timerTester.now + 200
            });

            StoreTest.dispatch<BStateTurnEndAction>({
                type: 'battle/state/event',
                eventType: 'TURN-END',
                payload: {}
            });

            expect(futureBattleData.battleHash).toBe(pastHash);
        });
    });
});
