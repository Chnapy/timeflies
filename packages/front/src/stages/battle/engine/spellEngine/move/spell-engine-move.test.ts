import { applyMiddleware, createStore, Middleware, Reducer, Store } from '@reduxjs/toolkit';
import { seedTiledMapAssets, waitTimeout, seedTiledMap } from '@timeflies/shared';
import { battleActionMiddleware } from '../../../battleState/battle-action-middleware';
import { battleActionReducer, BattleActionState } from '../../../battleState/battle-action-reducer';
import { BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedSpell } from '../../../entities/spell/Spell.seed';
import { SpellActionLaunchAction } from '../../../spellAction/spell-action-actions';

describe('# spell-engine-move (depends on #battle-action)', () => {

    const getStore = (initialState: BattleActionState, deps: Partial<Parameters<typeof battleActionMiddleware>[ 0 ]> = {}): {
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
            extractFutureCharacterPositionList: () => [],
            ...deps
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
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 0, y: 0 }
                    },
                    {
                        tileType: 'obstacle',
                        position: { x: 1, y: 0 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 2, y: 0 }
                    }
                ],
                path: [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 }
                ],
                rangeArea: [],
                actionArea: [],
                futureCharacterPosition: null
            };

            const { store } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 0, y: 0 }
                })
            });

            const action = TileHoverAction({
                position: { x: 2, y: 0 }
            });

            store.dispatch(action);

            await waitTimeout(50);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: []
            });
        });

        it.todo('should handle character positions');

        it('should define state path when path found (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 8, y: 6 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 9, y: 6 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 10, y: 6 }
                    }
                ],
                path: [],
                rangeArea: [],
                actionArea: [],
                futureCharacterPosition: null
            };

            const { store } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 8, y: 6 }
                })
            });

            const action = TileHoverAction({
                position: { x: 10, y: 6 }
            });

            store.dispatch(action);

            await waitTimeout(50);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: [
                    { x: 9, y: 6 },
                    { x: 10, y: 6 }
                ]
            });
        });
    });

    describe('on tile click', () => {

        it('should not dispatch on disable tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 7, y: 5 }
                    },
                    {
                        tileType: 'obstacle',
                        position: { x: 8, y: 5 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 9, y: 5 }
                    }
                ],
                path: [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 }
                ],
                rangeArea: [],
                actionArea: [],
                futureCharacterPosition: null
            };

            const { store, dispatchMock } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 0, y: 0 }
                })
            });

            const action = TileClickAction({
                position: { x: 8, y: 5 }
            });

            store.dispatch(action);

            await waitTimeout(50);

            expect(dispatchMock).not.toHaveBeenCalled();
        });

        it('should dispatch spell launch on available tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMap('map_1'),
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 7, y: 6 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 8, y: 6 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 9, y: 6 }
                    }
                ],
                path: [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 }
                ],
                rangeArea: [],
                actionArea: [],
                futureCharacterPosition: null
            };

            const { store, dispatchMock } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 7, y: 6 }
                })
            });

            const action = TileClickAction({
                position: { x: 9, y: 6 }
            });

            store.dispatch(action);

            await waitTimeout(50);

            expect(dispatchMock).toHaveBeenNthCalledWith(1, BattleStateSpellLaunchAction({
                spellActions: expect.arrayContaining([ expect.any(Object) ])
            }));
        });
    });

    describe('on commit', () => {

        it('should refresh grid, for future tile hovers', async () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMapAssets('map_1').schema,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 4, y: 3 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 4, y: 4 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 5, y: 4 }
                    }
                ],
                path: [],
                rangeArea: [],
                actionArea: [],
                futureCharacterPosition: null
            };

            const characterList = [
                seedCharacter({
                    id: '1', period: 'future', position: { x: 4, y: 3 }
                })
            ];

            const { store } = getStore(initialState, {
                extractState: () => initialState,
                extractFutureCharacter: () => characterList[ 0 ],
                extractFutureCharacterPositionList: () => characterList.map(c => c.position)
            });

            characterList.push(seedCharacter({ id: '2', period: 'future', position: { x: 4, y: 4 } }))

            store.dispatch(SpellActionLaunchAction({
                spellActList: [ {
                    startTime: Date.now(),
                    spellAction: {
                        spell: seedSpell({ id: 's1', period: 'future' }),
                        actionArea: [ { x: 0, y: 0 } ],
                        position: { x: 0, y: 0 }
                    }
                } ]
            }))

            const action2 = TileHoverAction({
                position: { x: 5, y: 4 }
            });

            store.dispatch(action2);

            await waitTimeout(50);

            expect(store.getState().path).toEqual([]);
        });
    });
});
