import { BattleSnapshot, createPosition, getBattleSnapshotWithHash, normalize, Normalized, TimerTester, characterEntityToSnapshot } from '@timeflies/shared';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { Team } from '../entities/team/Team';
import { SpellActionLaunchAction, SpellActionTimerEndAction } from '../spellAction/spell-action-actions';
import { getInitialSnapshotState, snapshotReducer } from './snapshot-reducer';

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

        const initialState = getInitialSnapshotState({
            myPlayerId: 'p1',
            battleDataCurrent: {
                battleHash: 'not-matter',
                characters: {},
                spells: {}
            },
            battleDataFuture: {
                battleHash: 'not-matter',
                characters: { [ character.id ]: character },
                spells: {}
            }
        });

        const state1 = snapshotReducer({
            getSpellLaunchFn: () => () => { }
        })(initialState, SpellActionLaunchAction({
            spellActList: [ {
                startTime: timerTester.now,
                spellAction: {
                    spell: seedSpell({ id: 's1', period: 'future' }),
                    position: createPosition(0, 0),
                    actionArea: normalize([ createPosition(0, 0) ])
                }
            } ]
        }));

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            time: timerTester.now,
            launchTime: -1,
            charactersSnapshots: [ characterEntityToSnapshot(character) ],
            spellsSnapshots: []
        };

        const { battleHash } = getBattleSnapshotWithHash(partialSnap);

        expect(state1.battleDataFuture.battleHash).toBe(battleHash);
        expect(state1.battleDataCurrent.battleHash).toBe(battleHash);
    });

    describe('spell action actions:', () => {

        it.skip('should rollback on spell action removed', () => {

            const teams: Normalized<Team> = {
                t1: {
                    id: 't1',
                    letter: 'A',
                }
            };

            const character = seedCharacter({ id: 'c1', period: 'future' });

            const initialState = getInitialSnapshotState({
                myPlayerId: 'p1',
                teamList: teams,
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    characters: {},
                    spells: {}
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    characters: { [ character.id ]: character },
                    spells: {}
                },
            });

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spell, snapshot, { characters }) => {
                    characters[ 'c1' ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: createPosition(0, 0),
                        actionArea: normalize([ createPosition(0, 0) ])
                    }
                } ]
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            timerTester.advanceBy(100);

            const state2 = snapshotReducer({
                getSpellLaunchFn: spellType => (spell, snapshot, { characters }) => {
                    characters[ 'c1' ].features.life = 20;
                }
            })(state1, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: createPosition(0, 0),
                        actionArea: normalize([ createPosition(0, 0) ])
                    }
                } ]
            }));

            const state3 = snapshotReducer()(state2, SpellActionTimerEndAction({
                removed: true,
                correctHash: firstHash,
                spellActionSnapshot: {} as any
            }));

            expect(state3.battleDataFuture.battleHash).toBe(firstHash);
            expect(state3.battleDataFuture.characters[ 'c1' ].features.life).toBe(50);
        });

        it.skip('should rollback on previous spell action removed and update current battle data', () => {

            const teams: Normalized<Team> = {
                t1: {
                    id: 't1',
                    letter: 'A',
                }
            };

            const character = seedCharacter({ id: 'c1', period: 'future' });

            const initialState = getInitialSnapshotState({
                myPlayerId: 'p1',
                teamList: teams,
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    characters: {},
                    spells: {}
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    characters: { [ character.id ]: character },
                    spells: {}
                },
            });

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spell, snapshot, { characters }) => {
                    characters[ 'c1' ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: createPosition(0, 0),
                        actionArea: normalize([ createPosition(0, 0) ])
                    }
                } ]
            }));

            const firstHash = state1.battleDataFuture.battleHash;

            timerTester.advanceBy(100);

            const state2 = snapshotReducer({
                getSpellLaunchFn: spellType => (spell, snapshot, { characters }) => {
                    characters[ 'c1' ].features.life = 20;
                }
            })(state1, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: createPosition(0, 0),
                        actionArea: normalize([ createPosition(0, 0) ])
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

            const teams: Normalized<Team> = {
                t1: {
                    id: 't1',
                    letter: 'A',
                }
            };

            const characterFuture = seedCharacter({ id: 'c1', period: 'future' });
            const characterCurrent = seedCharacter({ id: 'c1', period: 'current' });

            const initialState = getInitialSnapshotState({
                myPlayerId: 'p1',
                teamList: teams,
                battleDataCurrent: {
                    battleHash: 'not-matter',
                    characters: { [ characterCurrent.id ]: characterCurrent },
                    spells: {}
                },
                battleDataFuture: {
                    battleHash: 'not-matter',
                    characters: { [ characterFuture.id ]: characterFuture },
                    spells: {}
                },
            });

            const state1 = snapshotReducer({
                getSpellLaunchFn: spellType => (spell, snapshot, { characters }) => {
                    characters[ 'c1' ].features.life = 50;
                }
            })(initialState, SpellActionLaunchAction({
                spellActList: [ {
                    startTime: timerTester.now,
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        position: createPosition(0, 0),
                        actionArea: normalize([ createPosition(0, 0) ])
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

            const teams: Normalized<Team> = {
                t1: {
                    id: 't1',
                    letter: 'A'
                }
            };

            const initialState = getInitialSnapshotState({
                myPlayerId: 'p1',
                teamList: teams,
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    characters: {},
                    spells: {}
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    characters: {},
                    spells: {}
                },
            });

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

            const initialState = getInitialSnapshotState({
                myPlayerId: 'p1',
                snapshotList: [
                    {
                        battleHash: 'past-hash',
                        launchTime: -1,
                        time: timerTester.now - 100,
                        charactersSnapshots: [],
                        spellsSnapshots: [],
                    },
                    {
                        battleHash: 'future-hash-1',
                        launchTime: -1,
                        time: timerTester.now + 100,
                        charactersSnapshots: [],
                        spellsSnapshots: [],
                    },
                    {
                        battleHash: 'future-hash-2',
                        launchTime: -1,
                        time: timerTester.now + 200,
                        charactersSnapshots: [],
                        spellsSnapshots: [],
                    }
                ],
                battleDataCurrent: {
                    battleHash: 'not-defined-current',
                    characters: {},
                    spells: {}
                },
                battleDataFuture: {
                    battleHash: 'not-defined-future',
                    characters: {},
                    spells: {}
                },
            });

            const state1 = snapshotReducer()(initialState, BattleStateTurnEndAction());

            expect(state1.battleDataFuture.battleHash).toBe('past-hash');
        });
    });
});
