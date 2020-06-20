import { seedTiledMap } from '@timeflies/shared';
import Benchmark from 'benchmark';
import b from 'benny';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { battleActionReducer } from '../battleState/battle-action-reducer';
import { TileClickAction, TileHoverAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { BattleDataPeriod } from '../snapshot/battle-data';
import { getInitialSnapshotState } from '../snapshot/snapshot-reducer';
import { createView } from '../../../view';
import { render } from '@testing-library/react';

Benchmark.support.browser = false;

const initStore = () => {

    const getSpell = <P extends BattleDataPeriod>(period: P) => seedSpell<P>({
        id: 's1',
        period,
        characterId: 'c1',
        type: 'move',
        feature: {
            area: 999,
            attack: -1,
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
                globalTurnStartTime: Date.now(),
                turnId: 1,
                turnDuration: 9000,
                turnStartTime: Date.now()
            },
            snapshotState: getInitialSnapshotState({
                myPlayerId: 'p1',
                teamList: [ {
                    id: 't1',
                    letter: 'A'
                } ],
                playerList: [ {
                    id: 'p1',
                    name: '',
                    teamId: 't1'
                } ],
                battleDataCurrent: {
                    battleHash: '',
                    characters: [ getCharacter('current') ],
                    spells: [ getSpell('current') ]
                },
                battleDataFuture: {
                    battleHash: '',
                    characters: [ getCharacter('future') ],
                    spells: [ getSpell('future') ]
                },
            })
        }
    };

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
    });

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { }
    });

    render(view);

    // store.replaceReducer((state, action) => {
    //     console.log('action', action.type)
    //     return rootReducer(state, action);
    // });

    return {
        initialState,
        storeManager,
        assetLoader
    };
};

export const runBenchmark = () => {
    const { log, warn, error } = console;
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    return b.suite(
        'Name',

        // 520ms
        b.add('unallowed tile hover action (move)', () => {
            const { storeManager } = initStore();

            return async () => {
                await storeManager.dispatch(TileHoverAction({
                    position: { x: 8, y: 6 }
                }));
            };
        }),

        // 910ms
        b.add('allowed tile hover action (move)', () => {
            const { storeManager } = initStore();

            return async () => {
                await storeManager.dispatch(TileHoverAction({
                    position: { x: 9, y: 6 }
                }));
            };
        }),

        // 1250ms
        b.add('allowed tile click action (move)', () => {
            const { storeManager } = initStore();

            return async () => {
                await storeManager.dispatch(TileClickAction({
                    position: { x: 9, y: 6 }
                }));
            };
        }),

        b.cycle(),
        b.complete(summary => {
            console.log = log;
            console.warn = warn;
            console.error = error;

            return summary;
        }),
    );
};
