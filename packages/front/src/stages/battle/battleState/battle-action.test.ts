import { applyMiddleware, createStore, Store } from '@reduxjs/toolkit';
import { createPosition, normalize, seedTiledMapAssets } from '@timeflies/shared';
import { Reducer } from 'react';
import { getDispatchThenPassTimeouts } from '../../../test-utils';
import { battleReducer } from '../../../ui/reducers/battle-reducers/battle-reducer';
import { BattleStartAction } from '../battle-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { battleActionMiddleware } from './battle-action-middleware';
import { battleActionReducer, BattleActionState } from './battle-action-reducer';
import { BattleMapPathAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from './battle-state-actions';

describe('# battle-action', () => {

    const getStore = (initialState: BattleActionState, deps: Partial<Parameters<typeof battleActionMiddleware>[ 0 ]> = {}): Store<BattleActionState> => {

        const futureCharacter = seedCharacter({
            id: '1', period: 'future'
        });

        const futureSpell = seedSpell({
            id: 's1', period: 'future', type: 'move'
        });

        const reducer: Reducer<BattleActionState, any> = (...args) => {
            initialState = battleActionReducer(...args);
            return initialState;
        };

        const middleware = battleActionMiddleware({
            extractState: () => initialState,
            extractGrid: () => ({}),
            extractFutureAliveCharacterPositionList: () => [ futureCharacter.position ],
            extractFutureCharacter: () => futureCharacter,
            extractFutureSpell: () => futureSpell,
            getSpellEngineFromType: () => async () => { },
            extractBattleState: () => battleReducer(undefined, { type: '' }),
            ...deps
        });

        return createStore(reducer as any, initialState, applyMiddleware(middleware));
    };

    describe('on battle start', () => {

        it('should define new state', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null,
            };

            const store = getStore(initialState);

            const action = BattleStartAction({
                myPlayerId: 'p1',
                tiledMapAssets: {
                    schema: seedTiledMapAssets('map_1').schema,
                    imagesUrls: { toto: 'url' },
                },
                teamSnapshotList: [],
                playerSnapshotList: [],
                globalTurnSnapshot: {} as any,
                entitiesSnapshot: {
                    charactersSnapshots: [
                        {
                            id: '',
                            position: createPosition(2, 8)
                        }
                    ]
                } as any
            });

            await store.dispatch(action);

            expect(store.getState()).toEqual<BattleActionState>({
                tiledSchema: action.payload.tiledMapAssets.schema,
                tiledImagesUrls: { toto: 'url' },
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            });
        });
    });

    describe('on turn start', () => {

        it.todo('should not set action to spellPrepare, if character not mine');

        it.todo('should set action to spellPrepare, if character mine');

        it('should get spell engine and pass it action, if character mine', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const spellEngine = jest.fn(async () => { });

            const getSpellEngineFromType = jest.fn(() => spellEngine);

            const store = getStore(initialState, {
                extractFutureSpell: () => seedSpell({
                    id: 's1', period: 'future', type: 'move'
                }),
                getSpellEngineFromType
            });

            const action = BattleStateTurnStartAction({
                turnSnapshot: {
                    id: 1,
                    characterId: '1',
                    duration: 1000,
                    startTime: Date.now()
                },
                currentCharacter: seedCharacter({ id: 'c1', period: 'current', isMine: true })
            });

            const dispatchThenPassTimeouts = getDispatchThenPassTimeouts(store.dispatch);

            await dispatchThenPassTimeouts(action);

            expect(getSpellEngineFromType).toHaveBeenNthCalledWith(1, 'move', expect.anything(), expect.anything());
            expect(spellEngine).toHaveBeenNthCalledWith(1, action);
        });
    });

    describe('on turn end', () => {

        it('should set action to watch and clear areas', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'watch',
                path: [ createPosition(2, 2) ],
                rangeArea: normalize([ createPosition(3, 3) ]),
                actionArea: normalize([ createPosition(1, 1) ]),
                futureCharacterPosition: null
            };

            const store = getStore(initialState);

            const action = BattleStateTurnEndAction();

            await store.dispatch(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: [],
                rangeArea: {},
                actionArea: {}
            });
        });

        it('should not get spell engine', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const getSpellEngineFromType = jest.fn(() => jest.fn());

            const store = getStore(initialState, {
                getSpellEngineFromType
            });

            const action = BattleStateTurnEndAction();

            await store.dispatch(action);

            expect(getSpellEngineFromType).not.toHaveBeenCalled();
        });
    });

    describe('on map area', () => {

        it('should set given areas', async () => {

            const initialState: BattleActionState = {
                tiledSchema: null,
                tiledImagesUrls: {},
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const store = getStore(initialState);

            const action = BattleMapPathAction({
                path: [ createPosition(2, 3) ],
                rangeArea: normalize([ createPosition(8, 7) ]),
                actionArea: normalize([ createPosition(1, 1) ])
            });

            await store.dispatch(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState,
                path: [ createPosition(2, 3) ],
                rangeArea: normalize([ createPosition(8, 7) ]),
                actionArea: normalize([ createPosition(1, 1) ])
            });
        });
    });

    describe.skip('on commit', () => {

        it('should redefine grid', () => {

            const initialState: BattleActionState = {
                tiledSchema: seedTiledMapAssets('map_1').schema,
                tiledImagesUrls: { toto: 'url' },
                currentAction: 'watch',
                path: [],
                rangeArea: {},
                actionArea: {},
                futureCharacterPosition: null
            };

            const store = getStore(initialState);

            // const action = BattleCommitAction({
            //     time: Date.now(),
            //     charactersPositionList: [ { x: 2, y: 3 }, { x: 8, y: 6 } ]
            // });

            // store.dispatch(action);

            expect(store.getState()).toEqual<BattleActionState>({
                ...initialState
            })
        });
    });
});
