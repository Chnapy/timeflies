import { TimerTester, getBattleSnapshotWithHash, BattleSnapshot } from '@timeflies/shared';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { Team } from '../entities/team/Team';
import { SpellActionTimerEndAction, SpellActionLaunchAction } from '../spellAction/spell-action-actions';
import { snapshotReducer, SnapshotState } from './snapshot-reducer';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { characterToSnapshot } from '../entities/character/Character';

describe('# snapshot-reducer', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it.todo('on battle start');

    it('should commit battle data future on spell action, then get the correct hash', () => {

        const character = seedCharacter({ id: 'c1', period: 'future' });

        const initialState: SnapshotState = {
            myPlayerId: 'p1',
            launchTime: -1,
            snapshotList: [],
            battleDataCurrent: {
                battleHash: 'not-matter',
                teams: [],
                players: [],
                characters: [],
                spells: []
            },
            battleDataFuture: {
                battleHash: 'not-matter',
                teams: [],
                players: [],
                characters: [ character ],
                spells: []
            },
            currentSpellAction: null,
            spellActionSnapshotList: []
        };

        const state1 = snapshotReducer({
            getSpellLaunchFn: () => () => { }
        })(initialState, SpellActionLaunchAction({
            spellActList: [ {
                startTime: timerTester.now,
                spellAction: {
                    spell: seedSpell({ id: 's1', period: 'future' }),
                    position: { x: 0, y: 0 },
                    actionArea: [ { x: 0, y: 0 } ]
                }
            } ]
        }));

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            time: timerTester.now,
            launchTime: -1,
            teamsSnapshots: [],
            playersSnapshots: [],
            charactersSnapshots: [ characterToSnapshot(character) ],
            spellsSnapshots: []
        };

        const { battleHash } = getBattleSnapshotWithHash(partialSnap);

        expect(state1.battleDataFuture.battleHash).toBe(battleHash);
        expect(state1.battleDataCurrent.battleHash).toBe(battleHash);
    });

    describe('spell action actions:', () => {

        it('should rollback on spell action removed', () => {

            const teams: Team<any>[] = [
                {
                    id: 't1',
                    period: '' as any,
                    letter: 'A',
                }
            ];

            const character = seedCharacter({ id: 'c1', period: 'future' });

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: [],
                    spells: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: [ character ],
                    spells: []
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spellAction, { characters }) => {
                    characters[ 0 ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: { x: 0, y: 0 },
                        actionArea: [ { x: 0, y: 0 } ]
                    }
                } ]
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            timerTester.advanceBy(100);

            const state2 = snapshotReducer({
                getSpellLaunchFn: spellType => (spellAction, { characters }) => {
                    characters[ 0 ].features.life = 20;
                }
            })(state1, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: { x: 0, y: 0 },
                        actionArea: [ { x: 0, y: 0 } ]
                    }
                } ]
            }));

            const state3 = snapshotReducer()(state2, SpellActionTimerEndAction({
                removed: true,
                correctHash: firstHash,
                spellActionSnapshot: {} as any
            }));

            expect(state3.battleDataFuture.battleHash).toBe(firstHash);
            expect(state3.battleDataFuture.characters[ 0 ].features.life).toBe(50);
        });

        it('should rollback on previous spell action removed and update current battle data', () => {

            const teams: Team<any>[] = [
                {
                    id: 't1',
                    period: '' as any,
                    letter: 'A',
                }
            ];

            const character = seedCharacter({ id: 'c1', period: 'future' });

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: [],
                    spells: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams,
                    players: [],
                    characters: [ character ],
                    spells: []
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spellAction, { characters }) => {
                    characters[ 0 ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: { x: 0, y: 0 },
                        actionArea: [ { x: 0, y: 0 } ]
                    }
                } ]
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            timerTester.advanceBy(100);

            const state2 = snapshotReducer({
                getSpellLaunchFn: spellType => (spellAction, { characters }) => {
                    characters[ 0 ].features.life = 20;
                }
            })(state1, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: { x: 0, y: 0 },
                        actionArea: [ { x: 0, y: 0 } ]
                    }
                } ]
            }));

            const state3 = snapshotReducer()(state2, SpellActionTimerEndAction({
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
                    period: 'current',
                    letter: 'A',
                }
            ];

            const futureTeams: Team<'future'>[] = [
                {
                    id: 't1',
                    period: 'future',
                    letter: 'A',
                }
            ];

            const character = seedCharacter({ id: 'c1', period: 'future' });

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    teams: currentTeams,
                    players: [],
                    characters: [],
                    spells: []
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    teams: futureTeams,
                    players: [],
                    characters: [ character ],
                    spells: []
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spellAction, { characters }) => {
                    characters[ 0 ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: { x: 0, y: 0 },
                        actionArea: [ { x: 0, y: 0 } ]
                    }
                } ]
            }));

            const lastHash = state1.battleDataFuture.battleHash;

            const state2 = snapshotReducer()(state1, SpellActionTimerEndAction({
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
                    id: 't1',
                    period: '' as any,
                    letter: 'A'
                }
            ];

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    teams,
                    players: [],
                    characters: [],
                    spells: []
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    teams,
                    players: [],
                    characters: [],
                    spells: []
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer()(initialState, BattleStateTurnStartAction({
                turnSnapshot: {
                    id: 1,
                    characterId: 'not-matter',
                    duration: 1000,
                    startTime: -1
                },
                currentCharacter: seedCharacter({ id: '', period: 'current' })
            }));

            expect(state1.battleDataFuture.battleHash).not.toBe('not-defined-future');
            expect(state1.battleDataCurrent.battleHash).not.toBe('not-defined-current');
        });

        it('should rollback to before now on turn end', () => {

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [
                    {
                        battleHash: 'past-hash',
                        launchTime: -1,
                        time: timerTester.now - 100,
                        charactersSnapshots: [],
                        playersSnapshots: [],
                        spellsSnapshots: [],
                        teamsSnapshots: []
                    },
                    {
                        battleHash: 'future-hash-1',
                        launchTime: -1,
                        time: timerTester.now + 100,
                        charactersSnapshots: [],
                        playersSnapshots: [],
                        spellsSnapshots: [],
                        teamsSnapshots: []
                    },
                    {
                        battleHash: 'future-hash-2',
                        launchTime: -1,
                        time: timerTester.now + 200,
                        charactersSnapshots: [],
                        playersSnapshots: [],
                        spellsSnapshots: [],
                        teamsSnapshots: []
                    }
                ],
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    teams: [],
                    players: [],
                    characters: [],
                    spells: []
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    teams: [],
                    players: [],
                    characters: [],
                    spells: []
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer()(initialState, BattleStateTurnEndAction());

            expect(state1.battleDataFuture.battleHash).toBe('past-hash');
        });
    });
});
