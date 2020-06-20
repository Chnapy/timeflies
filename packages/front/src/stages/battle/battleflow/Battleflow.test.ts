import { seedTiledMap, TimerTester, seedSpellActionSnapshot, BattleSnapshot, getBattleSnapshotWithHash, SpellActionSnapshot } from '@timeflies/shared';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { battleActionReducer } from '../battleState/battle-action-reducer';
import { TileClickAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { BattleDataPeriod } from '../snapshot/battle-data';
import { SendMessageAction, ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { rootReducer } from '../../../ui/reducers/root-reducer';
import { AnyAction } from '@reduxjs/toolkit';
import { characterToSnapshot } from '../entities/character/Character';
import { spellToSnapshot } from '../entities/spell/Spell';
import { getInitialSnapshotState } from '../snapshot/snapshot-reducer';
import { denormalize } from '../entities/normalize';

describe('Battleflow', () => {

    const timerTester = new TimerTester();

    const init = () => {

        // const promiseList: Promise<any>[] = [];

        // global.Promise = class extends Promise<any> {
        //     constructor(e) {
        //         super(e);
        //         promiseList.push(this);
        //     }
        // };

        const getSpell = <P extends BattleDataPeriod>(period: P) => seedSpell<P>({
            id: 's1',
            period,
            characterId: 'c1',
            type: 'simpleAttack',
            feature: {
                area: 999,
                attack: 10,
                duration: 1500
            }
        });

        const getCharacter = <P extends BattleDataPeriod>(period: P) => seedCharacter<P>({
            id: 'c1',
            period,
            position: { x: 8, y: 6 },
            isMine: true,
            playerId: 'p1',
            features: {
                actionTime: 9000
            }
        });

        const initialState: GameState = {
            step: 'battle',
            currentPlayer: {
                id: 'p1',
                name: 'p1'
            },
            room: null,
            battle: {
                battleActionState: {
                    ...battleActionReducer(undefined, { type: '' }),
                    tiledSchema: seedTiledMap('map_1'),
                    futureCharacterPosition: { x: 8, y: 6 },
                    currentAction: 'spellPrepare',
                    selectedSpellId: 's1',
                    grid: [
                        {
                            position: { x: 8, y: 6 },
                            tileType: 'default'
                        },
                        {
                            position: { x: 9, y: 6 },
                            tileType: 'default'
                        }
                    ],
                    rangeArea: [ { x: 9, y: 6 } ]
                },
                cycleState: {
                    currentCharacterId: 'c1',
                    globalTurnId: 1,
                    globalTurnOrder: [ 'c1' ],
                    globalTurnStartTime: timerTester.now,
                    turnId: 1,
                    turnDuration: 9000,
                    turnStartTime: timerTester.now
                },
                snapshotState: getInitialSnapshotState({
                    myPlayerId: 'p1',
                    battleDataCurrent: {
                        battleHash: '',
                        characters: { c1: getCharacter('current') },
                        spells: { s1: getSpell('current') }
                    },
                    battleDataFuture: {
                        battleHash: '',
                        characters: { c1: getCharacter('future') },
                        spells: { s1: getSpell('future') }
                    },
                })
            }
        };

        const assetLoader = createAssetLoader();

        const createStore = () => {
            const { store } = createStoreManager({
                assetLoader,
                initialState,
            });

            const actionList: AnyAction[] = [];

            store.replaceReducer((state, action) => {
                actionList.push(action);
                // console.log('action', action);

                return rootReducer(state, action);
            });

            return {
                store,
                actionList
            };
        };

        return {
            initialState,
            createStore
        };
    };

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    describe('on turn action:', () => {

        it.skip('should change battle state to "spellPrepare" on turn start', () => {

            // const { bState } = init();

            // expect(bState.state).toBe<BState>('spellPrepare');
        });

        it.skip('should change battle state to "watch" on turn end', () => {

            // const { bState, characterCurrent } = init();

            // expect(bState.state).toBe<BState>('spellPrepare');

            // timerTester.advanceBy(characterCurrent.features.actionTime);

            // expect(bState.state).toBe<BState>('watch');
        });

        it.skip('should commit on turn start', () => {

            // const { currentBattleData, futureBattleData, battleHash } = init();

            // expect(currentBattleData.battleHash).not.toBe(battleHash);
            // expect(futureBattleData.battleHash).not.toBe(battleHash);
        });

        it.skip('should rollback on turn end', async () => {

            // const { currentBattleData, futureBattleData, bindAction, characterCurrent, posAvailables } = init();

            // timerTester.advanceBy(characterCurrent.features.actionTime - 50);

            // const firstHash = futureBattleData.battleHash;

            // const { onTileHover, onTileClick } = bindAction.payload;

            // await awaitAndAdvance10(onTileHover(posAvailables[ 0 ]));

            // await onTileClick(posAvailables[ 0 ]);

            // await serviceNetwork({});

            // timerTester.advanceBy(50);

            // expect(futureBattleData.battleHash).toBe(firstHash);
            // expect(currentBattleData.battleHash).toBe(firstHash);
        });

        it.skip('should start a new global turn after previous one ends', () => {

            // const { cycleBattleData, characterCurrent } = init();

            // timerTester.advanceBy(characterCurrent.features.actionTime);

            // timerTester.advanceBy(200);

            // expect(cycleBattleData.globalTurn?.state).toBe<GlobalTurnState>('ended');

            // StoreTest.dispatch(ReceiveMessageAction({
            //     type: 'battle-run/global-turn-start',
            //     sendTime: timerTester.now,
            //     globalTurnState: {
            //         id: 2,
            //         startTime: timerTester.now,
            //         order: [ characterCurrent.id ],
            //         currentTurn: {
            //             id: 2,
            //             startTime: timerTester.now,
            //             characterId: characterCurrent.id
            //         }
            //     }
            // }));

            // expect(cycleBattleData.globalTurn?.id).toBe(2);
        });
    });

    describe('on spell action:', () => {

        it.skip('should not allow to launch spell with not enough time to use it', async () => {

            const { initialState, createStore } = init();

            const { store } = createStore();

            store.dispatch(TileClickAction({
                position: { x: 9, y: 6 }
            }));

            jest.runOnlyPendingTimers();

            const state1 = store.getState();

            expect(state1).toEqual(initialState);
        });

        it('should commit', () => {

            const { initialState, createStore } = init();

            initialState.battle.snapshotState.snapshotList = [ {
                battleHash: 'first-hash',
                launchTime: -1,
                time: -1,
                charactersSnapshots: [],
                spellsSnapshots: []
            } ];

            const { store } = createStore();

            store.dispatch(TileClickAction({
                position: { x: 9, y: 6 }
            }));

            const state1 = store.getState();

            expect(state1.battle.snapshotState.battleDataFuture).not.toBe(initialState.battle.snapshotState.battleDataFuture);
            expect(state1.battle.snapshotState.battleDataCurrent).toBe(initialState.battle.snapshotState.battleDataCurrent);
        });

        it('should send message with correct hash', () => {

            const { initialState, createStore } = init();

            const { battleActionState, snapshotState } = initialState.battle;

            const getSpell = <P extends BattleDataPeriod>(period: P) => seedSpell<P>({
                id: 's2',
                period,
                type: 'simpleAttack',
                characterId: 'c1',
                feature: {
                    area: 999,
                    attack: 20,
                    duration: 100
                }
            });

            snapshotState.battleDataCurrent.spells.s2 = getSpell('current');
            snapshotState.battleDataFuture.spells.s2 = getSpell('future');
            battleActionState.selectedSpellId = 's2';
            battleActionState.currentAction = 'spellPrepare';

            initialState.battle.snapshotState.snapshotList = [ {
                battleHash: 'first-hash',
                launchTime: -1,
                time: -1,
                charactersSnapshots: [],
                spellsSnapshots: []
            } ];

            const characterSnapshot = characterToSnapshot(initialState.battle.snapshotState.battleDataCurrent.characters.c1);
            const spellsSnapshots = denormalize(initialState.battle.snapshotState.battleDataCurrent.spells).map(spellToSnapshot);

            const expectedSnapshot: Omit<BattleSnapshot, 'battleHash'> = {
                launchTime: -1,
                time: -1,
                charactersSnapshots: [
                    {
                        ...characterSnapshot,
                        features: {
                            ...characterSnapshot.features,
                            life: 80
                        }
                    }
                ],
                spellsSnapshots
            };

            const { battleHash } = getBattleSnapshotWithHash(expectedSnapshot);

            const { store, actionList } = createStore();

            store.dispatch(TileClickAction({
                position: { x: 9, y: 6 }
            }));

            jest.runOnlyPendingTimers();

            expect(store.getState().battle.snapshotState.battleDataFuture.characters.c1.features.life).toBe(80);

            expect(actionList).toContainEqual(SendMessageAction({
                type: 'battle/spellAction',
                spellAction: expect.objectContaining<Partial<SpellActionSnapshot>>({
                    battleHash
                })
            }));
        });

        it.skip('should change future battle data against current one after two spell actions', async () => {

            // const { characterCurrent, bindAction, currentBattleData, futureBattleData, posAvailables } = init();

            // const firstPos = characterCurrent.position;

            // const { onTileHover, onTileClick } = bindAction.payload;

            // // first spell action

            // await awaitAndAdvance10(onTileHover(posAvailables[ 0 ]))

            // await onTileClick(posAvailables[ 0 ]);

            // await serviceNetwork({});

            // expect(futureBattleData.characters[ 0 ].position).toEqual(posAvailables[ 0 ]);

            // // second spell action

            // await awaitAndAdvance10(onTileHover(posAvailables[ 1 ]))

            // await onTileClick(posAvailables[ 1 ]);

            // await serviceNetwork({});

            // expect(futureBattleData.characters[ 0 ].position).toEqual(posAvailables[ 1 ]);
            // expect(currentBattleData.characters[ 0 ].position).toEqual(firstPos);
        });
    });

    describe('on confirm message:', () => {

        it('should rollback on confirm KO', () => {

            const { initialState, createStore } = init();

            const { snapshotState } = initialState.battle;

            snapshotState.battleDataCurrent.battleHash = 'second-hash';
            snapshotState.battleDataFuture.battleHash = 'second-hash';
            snapshotState.currentSpellAction = seedSpellActionSnapshot('s1', {
                startTime: timerTester.now - 100,
                duration: 1000
            });
            snapshotState.spellActionSnapshotList = [ snapshotState.currentSpellAction ];
            snapshotState.snapshotList = [ {
                battleHash: 'first-hash',
                launchTime: -1,
                time: -1,
                charactersSnapshots: denormalize(snapshotState.battleDataCurrent.characters).map(characterToSnapshot),
                spellsSnapshots: [ {
                    ...snapshotState.battleDataCurrent.spells.s1,
                    features: {
                        area: -1,
                        attack: 10,
                        duration: 1234
                    }
                } ]
            } ];

            const { store } = createStore();

            store.dispatch(ReceiveMessageAction({
                type: 'confirm',
                sendTime: timerTester.now,
                isOk: false,
                lastCorrectHash: 'first-hash'
            }));

            jest.runOnlyPendingTimers();

            const state1 = store.getState();

            expect(state1.battle.snapshotState.battleDataCurrent.battleHash).toEqual('first-hash');
            expect(state1.battle.snapshotState.battleDataFuture.battleHash).toEqual('first-hash');
            expect(state1.battle.snapshotState.battleDataCurrent.spells.s1.feature).toEqual(snapshotState.snapshotList[ 0 ].spellsSnapshots[ 0 ].features);
            expect(state1.battle.snapshotState.currentSpellAction).toEqual(null);
            expect(state1.battle.snapshotState.spellActionSnapshotList).toEqual([]);
        });

    });
});
