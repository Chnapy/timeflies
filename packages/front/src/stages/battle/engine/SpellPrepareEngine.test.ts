import { TimerTester } from '@timeflies/shared';
import { BattleDataCycle, BattleDataFuture } from '../../../BattleData';
import { StoreTest } from '../../../StoreTest';
import { BattleStateSpellPrepareAction } from '../battleState/battle-state-actions';
import { seedGlobalTurn } from '../cycle/global-turn.seed';
import { seedTurn } from '../cycle/turn.seed';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedMapManager } from '../map/MapManager.seed';
import { SpellEngineBindAction } from './engine-actions';
import { SpellPrepareEngine, SpellPrepareSubEngine } from './SpellPrepareEngine';

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
                event: BattleStateSpellPrepareAction({
                    spellType: spell.staticData.type
                }),
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

        const bindAction = StoreTest.getActions().find(SpellEngineBindAction.match)!;

        bindAction.payload.onTileHover({ x: -1, y: -1 });
        expect(onTileHover).not.toHaveBeenCalled();

        bindAction.payload.onTileClick({ x: -1, y: -1 });
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
                event: BattleStateSpellPrepareAction({
                    spellType: spell.staticData.type
                }),
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

        const bindAction = StoreTest.getActions().find(SpellEngineBindAction.match)!;

        bindAction.payload.onTileHover({ x: -1, y: -1 });
        expect(onTileHover).toHaveBeenCalledTimes(1);

        bindAction.payload.onTileClick({ x: -1, y: -1 });
        expect(onTileClick).toHaveBeenCalledTimes(1);
    });

});
