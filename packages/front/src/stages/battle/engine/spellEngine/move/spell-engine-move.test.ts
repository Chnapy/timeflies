import { applyMiddleware, createStore, Middleware, Reducer, Store } from '@reduxjs/toolkit';
import { createPosition, normalize, seedTiledMap, seedTiledMapAssets } from '@timeflies/shared';
import { battleActionMiddleware } from '../../../battleState/battle-action-middleware';
import { battleActionReducer, BattleActionState } from '../../../battleState/battle-action-reducer';
import { BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedSpell } from '../../../entities/spell/Spell.seed';
import { SpellActionLaunchAction } from '../../../spellAction/spell-action-actions';
import { CreateTileTypeGetter, spellEngineMove } from './spell-engine-move';

describe('# spell-engine-move (depends on #battle-action)', () => {

    const getStore = (
        initialState: BattleActionState,
        createTileTypeGetter: CreateTileTypeGetter,
        middlewareDeps: Partial<Parameters<typeof spellEngineMove>[ 0 ]> = {}
    ): {
        store: Store<BattleActionState>;
        dispatchMock: jest.Mock;
    } => {

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

        const middleware = battleActionMiddleware({
            extractState: () => initialState,
            extractFutureCharacter: () => futureCharacter,
            extractFutureSpell: () => futureSpell,
            extractFutureAliveCharacterPositionList: () => [],
            getSpellEngineFromType: (spellType, api, deps) => spellEngineMove({
                ...deps,
                createTileTypeGetter
            })(api),
            ...middlewareDeps
        });

        let dispatchMock;

        const wrapMiddleware: Middleware = (api) => {
            api.dispatch = jest.fn(api.dispatch);
            dispatchMock = api.dispatch;
            return middleware(api);
        };

        const store = createStore(reducer as any, initialState, applyMiddleware(wrapMiddleware));

        return { store, dispatchMock };
    };

    describe('on tile hover', () => {

        it('should clear state path when no path found (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: normalize([
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
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store } = getStore(initialState,
                () => () => 'obstacle',
                {
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action);

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
                grid: normalize([
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
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store } = getStore(initialState,
                () => () => 'default',
                {
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action);

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
                grid: normalize([
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
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const mainCharacter = seedCharacter({
                id: '1', period: 'future', position: createPosition(0, 0)
            });

            const { store } = getStore(initialState,
                () => p => p.y ? 'obstacle' : 'default',
                {
                    extractFutureCharacter: () => mainCharacter,
                    extractFutureAliveCharacterPositionList: () => [
                        mainCharacter.position,
                        createPosition(1, 0)
                    ]
                });

            const action = TileHoverAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action);

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
                grid: normalize([
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
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store, dispatchMock } = getStore(initialState,
                () => ({ x, y }) => y || x === 1 ? 'obstacle' : 'default',
                {
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileClickAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action);

            expect(dispatchMock).not.toHaveBeenCalled();
        });

        it('should dispatch spell launch on available tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: normalize([
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
                path: [
                    createPosition(1, 0),
                    createPosition(2, 0)
                ],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const { store, dispatchMock } = getStore(initialState,
                () => () => 'default',
                {
                    extractFutureCharacter: () => seedCharacter({
                        id: '1', period: 'future', position: createPosition(0, 0)
                    })
                });

            const action = TileClickAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action);

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
                grid: normalize([
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

            const { store } = getStore(initialState,
                () => p => p.y ? 'obstacle' : 'default',
                {
                    extractState: () => initialState,
                    extractFutureCharacter: () => characterList[ 0 ],
                    extractFutureAliveCharacterPositionList: () => characterList.map(c => c.position)
                });

            characterList.push(seedCharacter({ id: '2', period: 'future', position: createPosition(1, 0) }));

            await store.dispatch(SpellActionLaunchAction({
                spellActList: [ {
                    startTime: Date.now(),
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        actionArea: normalize([ createPosition(0, 0) ]),
                        position: createPosition(0, 0)
                    }
                } ]
            }))

            const action2 = TileHoverAction({
                position: createPosition(2, 0)
            });

            await store.dispatch(action2);

            expect(store.getState().path).toEqual([]);
        });
    });
});
