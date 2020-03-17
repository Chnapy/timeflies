import { StoreTest } from '../../../StoreTest';
import { SpellPrepareEngine, SpellPrepareSubEngine } from './SpellPrepareEngine';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { StaticSpell, TimerTester } from '@timeflies/shared';
import { SpellEngineBindAction } from './Engine';
import { BattleData, BattleDataCycle } from '../../../BattleData';
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

    it('should launch bind action on creation', () => {

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
                    synchronize() { }
                },
                start() {},
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
                    future: future as BattleData,
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

        expect(StoreTest.getActions()[ 0 ]).toStrictEqual<SpellEngineBindAction>({
            type: 'battle/spell-engine/bind',
            onTileHover,
            onTileClick
        });

    });

});
