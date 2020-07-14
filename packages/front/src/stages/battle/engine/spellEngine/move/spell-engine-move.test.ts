import { applyMiddleware, createStore, Middleware, Reducer } from '@reduxjs/toolkit';
import { createPosition, normalize, seedTiledMap, seedTiledMapAssets } from '@timeflies/shared';
import { battleActionMiddleware } from '../../../battleState/battle-action-middleware';
import { battleActionReducer, BattleActionState } from '../../../battleState/battle-action-reducer';
import { BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedSpell } from '../../../entities/spell/Spell.seed';
import { SpellActionLaunchAction } from '../../../spellAction/spell-action-actions';
import { CreateTileTypeGetter, spellEngineMove } from './spell-engine-move';
import { battleReducer, BattleState } from '../../../../../ui/reducers/battle-reducers/battle-reducer';
import { getInitialCycleState } from '../../../cycle/cycle-reducer';
import { getDispatchThenPassTimeouts } from '../../../../../test-utils';

describe('# spell-engine-move (depends on #battle-action)', () => {

    const getStore = (
        initialState: BattleActionState,
        createTileTypeGetter: CreateTileTypeGetter,
        middlewareDeps: Partial<Parameters<typeof spellEngineMove>[ 0 ]> = {}
    ) => {

        const futureCharacter = seedCharacter({
            id: '1', period: 'future'
        });

        const futureSpell = seedSpell({
            id: 's1', period: 'future', type: 'move'
        });

        const reducer: Reducer<BattleActionState, any> = (...args) => {
            initialState = battleActionReducer(...args)
            return initialState;
        };

        const battleState: BattleState = {
            ...battleReducer(undefined, { type: '' }),
            cycleState: {
                ...getInitialCycleState(),
                currentCharacterId: '1',
                turnDuration: 10000,
                turnStartTime: Date.now() - 100,
            }
        };

        const middleware = battleActionMiddleware({
            extractState: () => initialState,
            extractGrid: () => ({}),
            extractFutureCharacter: () => futureCharacter,
            extractFutureSpell: () => futureSpell,
            extractFutureAliveCharacterPositionList: () => [],
            getSpellEngineFromType: (spellRole, api, deps) => spellEngineMove({
                ...deps,
                createTileTypeGetter,
                extractBattleState: () => battleState
            })(api),
            extractBattleState: () => battleState,
            ...middlewareDeps
        });

        let dispatchMock;

        const wrapMiddleware: Middleware = (api) => {
            api.dispatch = jest.fn(api.dispatch);
            dispatchMock = api.dispatch;
            return middleware(api);
        };

        const store = createStore(reducer as any, initialState, applyMiddleware(wrapMiddleware));

        const dispatchThenPassTimeouts = getDispatchThenPassTimeouts(store.dispatch);

        return { store, dispatchMock, dispatchThenPassTimeouts };
    };

    describe('on tile hover', () => {

        it('should clear state path when no path found (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store, dispatchThenPassTimeouts } = getStore(initialState,
                () => () => 'obstacle',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'obstacle',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await dispatchThenPassTimeouts(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: []
            });
        });

        it('should define state path when path found (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store, dispatchThenPassTimeouts } = getStore(initialState,
                () => () => 'default',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await dispatchThenPassTimeouts(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ]
            });
        });

        it('should handle character positions', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const mainCharacter = seedCharacter({
                id: '1', period: 'future', position: createPosition(0, 0)
            });

            const { store, dispatchThenPassTimeouts } = getStore(initialState,
                () => p => p.y ? 'obstacle' : 'default',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractFutureCharacter: () => mainCharacter,
                    extractFutureAliveCharacterPositionList: () => [
                        mainCharacter.position,
                        createPosition(1, 0)
                    ]
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await dispatchThenPassTimeouts(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: []
            });
        });
    });

    describe('on tile click', () => {

        it('should not dispatch on disable tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { dispatchMock, dispatchThenPassTimeouts } = getStore(initialState,
                () => ({ x, y }) => y || x === 1 ? 'obstacle' : 'default',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'obstacle',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileClickAction({
                position: createPosition(2, 0)
            });

            await dispatchThenPassTimeouts(action);

            expect(dispatchMock).not.toHaveBeenCalled();
        });

        it('should dispatch spell launch on available tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { dispatchMock, dispatchThenPassTimeouts } = getStore(initialState,
                () => () => 'default',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileClickAction({
                position: createPosition(2, 0)
            });

            await dispatchThenPassTimeouts(action);

            expect(dispatchMock).toHaveBeenNthCalledWith(1, BattleStateSpellLaunchAction({
                spellActions: expect.arrayContaining([ expect.any(Object) ])
            }));
        });
    });

    describe('on spell launch', () => {

        it('should refresh grid, for future tile hovers', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMapAssets('map_1').schema,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const characterList = [
                seedCharacter({
                    id: '1', period: 'future', position: createPosition(0, 0)
                })
            ];

            const { store, dispatchThenPassTimeouts } = getStore(initialState,
                () => p => p.y ? 'obstacle' : 'default',
                {
                    extractGrid: () => normalize([
                        {
                            ...createPosition(0, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(1, 0),
                            tileType: 'default',
                        },
                        {
                            ...createPosition(2, 0),
                            tileType: 'default',
                        }
                    ]),
                    extractState: () => initialState,
                    extractFutureCharacter: () => characterList[ 0 ],
                    extractFutureAliveCharacterPositionList: () => characterList.map(c => c.position)
                });

            characterList.push(seedCharacter({ id: '2', period: 'future', position: createPosition(1, 0) }));

            await dispatchThenPassTimeouts(SpellActionLaunchAction({
                spellActList: [ {
                    startTime: Date.now(),
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        actionArea: normalize([ createPosition(0, 0) ]),
                        position: createPosition(0, 0)
                    }
                } ]
            }), true);

            await dispatchThenPassTimeouts(TileHoverAction({
                position: createPosition(2, 0)
            }));

            expect(store.getState().path).toEqual([]);
        });
    });
});
