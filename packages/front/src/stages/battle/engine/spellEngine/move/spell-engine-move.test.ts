import { applyMiddleware, createStore, Middleware, Reducer, Store } from '@reduxjs/toolkit';
import { seedTiledMapAssets, waitTimeout } from '@timeflies/shared';
import { battleActionMiddleware } from '../../../battleState/battle-action-middleware';
import { battleActionReducer, BattleActionState } from '../../../battleState/battle-action-reducer';
import { BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedSpell } from '../../../entities/spell/Spell.seed';

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
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                charactersPositionList: [],
                easyStarGrid: [
                    [ 0, 1, 0 ]
                ],
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
                actionArea: []
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
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                charactersPositionList: [],
                easyStarGrid: [
                    [ 0, 0, 0 ]
                ],
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 0, y: 0 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 1, y: 0 }
                    },
                    {
                        tileType: 'default',
                        position: { x: 2, y: 0 }
                    }
                ],
                path: [],
                rangeArea: [],
                actionArea: []
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
                path: [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 }
                ]
            });
        });
    });

    describe('on tile click', () => {

        it('should not dispatch on disable tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                charactersPositionList: [],
                easyStarGrid: [
                    [ 0, 1, 0 ]
                ],
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
                actionArea: []
            };

            const { store, dispatchMock } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 0, y: 0 }
                })
            });

            const action = TileClickAction({
                position: { x: 2, y: 0 }
            });

            store.dispatch(action);

            await waitTimeout(50);

            expect(dispatchMock).not.toHaveBeenCalled();
        });

        it('should dispatch spell launch on available tile (async)', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'spellPrepare',
                charactersPositionList: [],
                easyStarGrid: [
                    [ 0, 0, 0 ]
                ],
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 0, y: 0 }
                    },
                    {
                        tileType: 'default',
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
                actionArea: []
            };

            const { store, dispatchMock } = getStore(initialState, {
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 0, y: 0 }
                })
            });

            const action = TileClickAction({
                position: { x: 2, y: 0 }
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
                charactersPositionList: [],
                easyStarGrid: [
                    [ 0, 0, 0 ]
                ],
                grid: [
                    {
                        tileType: 'default',
                        position: { x: 0, y: 0 }
                    },
                    {
                        tileType: 'default',
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
                actionArea: []
            };

            const { store } = getStore(initialState, {
                extractState: () => initialState,
                extractFutureCharacter: () => seedCharacter({
                    id: '1', period: 'future', position: { x: 0, y: 0 }
                })
            });

            initialState.easyStarGrid[ 0 ][ 1 ] = 1;

            const action1 = BattleCommitAction({
                time: -1,
                charactersPositionList: []
            });

            store.dispatch(action1);

            const action2 = TileHoverAction({
                position: { x: 2, y: 0 }
            });

            store.dispatch(action2);

            await waitTimeout(50);

            expect(store.getState().path).toEqual([]);
        });
    });
});
