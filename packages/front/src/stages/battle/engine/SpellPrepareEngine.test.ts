import { StoreTest } from '../../../StoreTest';
import { SpellPrepareEngine, SpellPrepareSubEngine } from './SpellPrepareEngine';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { StaticSpell, TimerTester } from '@timeflies/shared';
import { SpellEngineBindAction } from './Engine';
import { BattleData, BattleDataCycle, BattleDataFuture } from '../../../BattleData';
import { seedMapManager } from '../map/MapManager.seed';

describe('# SpellPrepareEngine', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should not allow to launch hover & click functions if not enough time', () => {

        const staticData: StaticSpell = {
            id: '1',
            type: 'move',
            name: '',
            color: '',
            initialFeatures: {
                area: 1,
                attack: -1,
                duration: 200
            }
        };

        const character = seedCharacter({
            staticData: {
                staticSpells: [ staticData ],
                defaultSpellId: staticData.id
            },
            spellsSnapshots: [ {
                id: staticData.id,
                staticData,
                features: {
                    area: 1,
                    attack: -1,
                    duration: 200
                }
            } ],
        });

        const cycle: BattleDataCycle = {
            launchTime: -1,
            globalTurn: {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character,
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return 100; }
                },
                start() { },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            }
        }

        const future: Pick<BattleData, 'characters'> = {
            characters: [ character ],
        };

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: future as BattleDataFuture,
                    current: null as any,
                    cycle
                }
            }
        });

        const [ spell ] = character.spells;

        const onTileHover = jest.fn();
        const onTileClick = jest.fn();

        const engine = SpellPrepareEngine(
            {
                event: {
                    type: 'battle/state/event',
                    eventType: 'SPELL-PREPARE',
                    payload: {
                        spellType: spell.staticData.type
                    }
                },
                deps: {
                    mapManager: seedMapManager()
                }
            },
            {
                move: (spell, mapManager): SpellPrepareSubEngine => {

                    return {
                        onTileHover,
                        onTileClick
                    }
                }
            }
        );

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        bindAction.onTileHover({x: -1, y: -1});
        expect(onTileHover).not.toHaveBeenCalled();

        bindAction.onTileClick({x: -1, y: -1});
        expect(onTileClick).not.toHaveBeenCalled();
    });

    it('should allow to launch hover & click functions if enough time', () => {

        const staticData: StaticSpell = {
            id: '1',
            type: 'move',
            name: '',
            color: '',
            initialFeatures: {
                area: 1,
                attack: -1,
                duration: 200
            }
        };

        const character = seedCharacter({
            staticData: {
                staticSpells: [ staticData ],
                defaultSpellId: staticData.id
            },
            spellsSnapshots: [ {
                id: staticData.id,
                staticData,
                features: {
                    area: 1,
                    attack: -1,
                    duration: 200
                }
            } ],
        });

        const cycle: BattleDataCycle = {
            launchTime: -1,
            globalTurn: {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character,
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return 300; }
                },
                start() { },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            }
        }

        const future: Pick<BattleData, 'characters'> = {
            characters: [ character ],
        };

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: future as BattleDataFuture,
                    current: null as any,
                    cycle
                }
            }
        });

        const [ spell ] = character.spells;

        const onTileHover = jest.fn();
        const onTileClick = jest.fn();

        const engine = SpellPrepareEngine(
            {
                event: {
                    type: 'battle/state/event',
                    eventType: 'SPELL-PREPARE',
                    payload: {
                        spellType: spell.staticData.type
                    }
                },
                deps: {
                    mapManager: seedMapManager()
                }
            },
            {
                move: (spell, mapManager): SpellPrepareSubEngine => {

                    return {
                        onTileHover,
                        onTileClick
                    }
                }
            }
        );

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        bindAction.onTileHover({x: -1, y: -1});
        expect(onTileHover).toHaveBeenCalledTimes(1);

        bindAction.onTileClick({x: -1, y: -1});
        expect(onTileClick).toHaveBeenCalledTimes(1);
    });

});
