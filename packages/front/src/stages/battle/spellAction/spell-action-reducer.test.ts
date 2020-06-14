import { seedSpellActionSnapshot, SpellActionSnapshot } from '@timeflies/shared';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { snapshotReducer, SnapshotState } from '../snapshot/snapshot-reducer';
import { SpellActionCancelAction, SpellActionLaunchAction, SpellActionTimerEndAction } from './spell-action-actions';

describe('# spell-action-reducer', () => {

    describe('on spell launch action', () => {

        it('should store snapshot list', () => {

            const spells = [
                seedSpell({ id: 's1', period: 'future', characterId: 'c1' }),
                seedSpell({ id: 's2', period: 'future', characterId: 'c1' })
            ];

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
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
                    characters: [
                        seedCharacter({ id: 'c1', period: 'future' })
                    ],
                    spells
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const now = Date.now();

            const state1 = snapshotReducer()(initialState, SpellActionLaunchAction({
                spellActList: [
                    {
                        spellAction: {
                            spell: spells[ 0 ],
                            position: { x: 0, y: 0 },
                            actionArea: []
                        },
                        startTime: now
                    },
                    {
                        spellAction: {
                            spell: spells[ 1 ],
                            position: { x: 0, y: 0 },
                            actionArea: []
                        },
                        startTime: now + 100
                    }
                ]
            }));

            expect(state1.spellActionSnapshotList).toEqual([
                expect.objectContaining<Partial<SpellActionSnapshot>>({
                    spellId: 's1',
                    position: { x: 0, y: 0 },
                    startTime: now
                }),
                expect.objectContaining<Partial<SpellActionSnapshot>>({
                    spellId: 's2',
                    position: { x: 0, y: 0 },
                    startTime: now + 100
                }),
            ]);
        });

        it('should not set current spell if already defined', () => {

            const spells = [
                seedSpell({ id: 's1', period: 'future', characterId: 'c1' })
            ];

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
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
                    characters: [
                        seedCharacter({ id: 'c1', period: 'future' })
                    ],
                    spells
                },
                currentSpellAction: seedSpellActionSnapshot('s0'),
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer()(initialState, SpellActionLaunchAction({
                spellActList: [
                    {
                        spellAction: {
                            spell: spells[ 0 ],
                            position: { x: 0, y: 0 },
                            actionArea: []
                        },
                        startTime: Date.now()
                    }
                ]
            }));

            expect(state1.currentSpellAction).toEqual(initialState.currentSpellAction);
        });

        it('should set current spell if not defined', () => {

            const spells = [
                seedSpell({ id: 's1', period: 'future', characterId: 'c1' }),
                seedSpell({ id: 's2', period: 'future', characterId: 'c1' })
            ];

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
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
                    characters: [
                        seedCharacter({ id: 'c1', period: 'future' })
                    ],
                    spells
                },
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const now = Date.now();

            const state1 = snapshotReducer()(initialState, SpellActionLaunchAction({
                spellActList: [
                    {
                        spellAction: {
                            spell: spells[ 0 ],
                            position: { x: 0, y: 0 },
                            actionArea: []
                        },
                        startTime: now
                    },
                    {
                        spellAction: {
                            spell: spells[ 1 ],
                            position: { x: 0, y: 0 },
                            actionArea: []
                        },
                        startTime: now + 100
                    }
                ]
            }));

            expect(state1.currentSpellAction).toMatchObject<Partial<SpellActionSnapshot>>({
                spellId: 's1',
                startTime: now
            });
        });
    });

    it('should reset current spell on spell timer end action', () => {

        const spells = [
            seedSpell({ id: 's1', period: 'future', characterId: 'c1' }),
            seedSpell({ id: 's2', period: 'future', characterId: 'c1' })
        ];

        const initialState: SnapshotState = {
            myPlayerId: 'p1',
            launchTime: -1,
            snapshotList: [ {
                battleHash: 'correct-hash',
                launchTime: -1,
                time: -1,
                charactersSnapshots: [],
                playersSnapshots: [],
                spellsSnapshots: [],
                teamsSnapshots: []
            } ],
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
                characters: [
                    seedCharacter({ id: 'c1', period: 'future' })
                ],
                spells
            },
            currentSpellAction: seedSpellActionSnapshot('s1'),
            spellActionSnapshotList: []
        };

        const state1 = snapshotReducer()(initialState, SpellActionTimerEndAction({
            removed: false,
            correctHash: 'correct-hash',
            spellActionSnapshot: initialState.currentSpellAction!
        }));

        expect(state1.currentSpellAction).toEqual(null);
    });

    it('should clear snapshot list on turn start action', () => {

        const initialState: SnapshotState = {
            myPlayerId: 'p1',
            launchTime: -1,
            snapshotList: [],
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
            spellActionSnapshotList: [
                seedSpellActionSnapshot('s1'),
                seedSpellActionSnapshot('s2')
            ]
        };

        const state1 = snapshotReducer()(initialState, BattleStateTurnStartAction({
            turnSnapshot: {
                id: 1,
                characterId: '1',
                startTime: -1,
                duration: -1
            },
            currentCharacter: seedCharacter({ id: '', period: 'current' })
        }));

        expect(state1.spellActionSnapshotList).toHaveLength(0);
    });

    describe('on spell cancel action', () => {

        it('should remove current spell', () => {

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
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
                currentSpellAction: seedSpellActionSnapshot('s1'),
                spellActionSnapshotList: []
            };

            const state1 = snapshotReducer()(initialState, SpellActionCancelAction({
                spellActionSnapshotsValids: []
            }));

            expect(state1.currentSpellAction).toEqual(null);
        });

        it('should clear snapshot list', () => {

            const initialState: SnapshotState = {
                myPlayerId: 'p1',
                launchTime: -1,
                snapshotList: [],
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
                spellActionSnapshotList: [
                    seedSpellActionSnapshot('s1'),
                    seedSpellActionSnapshot('s2')
                ]
            };

            const state1 = snapshotReducer()(initialState, SpellActionCancelAction({
                spellActionSnapshotsValids: initialState.spellActionSnapshotList.slice(0, 1)
            }));

            expect(state1.spellActionSnapshotList).toEqual(initialState.spellActionSnapshotList.slice(0, 1));
        });
    });
});
