import { StoreTest } from '../../../StoreTest';
import { SpellPrepareEngine, SpellPrepareSubEngine } from './SpellPrepareEngine';
import { seedCharacter } from '../entities/character/Character.seed';
import { TimerTester } from '@timeflies/shared';
import { SpellEngineBindAction } from './Engine';
import { BattleDataCycle, BattleDataFuture } from '../../../BattleData';
import { seedMapManager } from '../map/MapManager.seed';
import { seedGlobalTurn } from '../cycle/global-turn.seed';
import { seedTurn } from '../cycle/turn.seed';

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

        const characterCurrent = seedCharacter('fake', {
            period: 'current',
            id: '1',
            player: null,
            seedSpells: [ {
                id: 's1',
                type: 'move',
                initialFeatures: {
                    duration: 200
                }
            } ]
        });

        const characterFuture = seedCharacter('fake', {
            period: 'future',
            id: '1',
            player: null,
            seedSpells: [ {
                id: 's1',
                type: 'move',
                initialFeatures: {
                    duration: 200
                }
            } ]
        });

        const cycle: BattleDataCycle = {
            launchTime: -1,
            globalTurn: seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    id: 1,
                    character: characterCurrent,
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                    getRemainingTime() { return 100; }
                })
            })
        }

        const future: Pick<BattleDataFuture, 'characters'> = {
            characters: [ characterFuture ],
        };

        StoreTest.initStore({
            battle: {
                future: future as BattleDataFuture,
                current: null as any,
                cycle
            }
        });

        const [ spell ] = characterCurrent.spells;

        const onTileHover = jest.fn();
        const onTileClick = jest.fn();

        SpellPrepareEngine(
            {
                event: {
                    type: 'battle/state/event',
                    eventType: 'SPELL-PREPARE',
                    payload: {
                        spellType: spell.staticData.type
                    }
                },
                deps: {
                    mapManager: seedMapManager('fake')
                }
            },
            spellType => ({
                move: (spell, mapManager): SpellPrepareSubEngine<any> => {

                    return {
                        getRangeArea() { return [] },
                        onTileHover,
                        onTileClick,
                        stop() { }
                    }
                }
            }[ spellType ])
        );

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        bindAction.onTileHover({ x: -1, y: -1 });
        expect(onTileHover).not.toHaveBeenCalled();

        bindAction.onTileClick({ x: -1, y: -1 });
        expect(onTileClick).not.toHaveBeenCalled();
    });

    it('should allow to launch hover & click functions if enough time', () => {

        const characterCurrent = seedCharacter('fake', {
            period: 'current',
            id: '1',
            player: null,
            seedSpells: [ {
                id: 's1',
                type: 'move',
                initialFeatures: {
                    duration: 200
                }
            } ]
        });

        const characterFuture = seedCharacter('fake', {
            period: 'future',
            id: '1',
            player: null,
            seedSpells: [ {
                id: 's1',
                type: 'move',
                initialFeatures: {
                    duration: 200
                }
            } ]
        });

        const cycle: BattleDataCycle = {
            launchTime: -1,
            globalTurn: seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characterCurrent,
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                    getRemainingTime() { return 300; }
                })
            })
        }

        const future: Pick<BattleDataFuture, 'characters'> = {
            characters: [ characterFuture ],
        };

        StoreTest.initStore({
            battle: {
                future: future as BattleDataFuture,
                current: null as any,
                cycle
            }
        });

        const [ spell ] = characterCurrent.spells;

        const onTileHover = jest.fn();
        const onTileClick = jest.fn();

        SpellPrepareEngine(
            {
                event: {
                    type: 'battle/state/event',
                    eventType: 'SPELL-PREPARE',
                    payload: {
                        spellType: spell.staticData.type
                    }
                },
                deps: {
                    mapManager: seedMapManager('fake')
                }
            },
            spellType => ({
                move: (spell, mapManager): SpellPrepareSubEngine<any> => {

                    return {
                        getRangeArea() { return [] },
                        onTileHover,
                        onTileClick,
                        stop() { }
                    }
                }
            }[ spellType ])
        );

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        bindAction.onTileHover({ x: -1, y: -1 });
        expect(onTileHover).toHaveBeenCalledTimes(1);

        bindAction.onTileClick({ x: -1, y: -1 });
        expect(onTileClick).toHaveBeenCalledTimes(1);
    });

});
