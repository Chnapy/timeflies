import { StoreTest } from '../../../StoreTest';
import { seedMapManager } from '../map/MapManager.seed';
import { BattleStateSpellPrepareAction } from './battle-state-actions';
import { BState } from './BattleStateSchema';
import { BStateMachine } from './BStateMachine';


describe('# BStateMachine', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should initialize with the initial state', () => {

        const machine = BStateMachine(seedMapManager('fake'), {
            battleStateSchemaCreator: () => ({
                initialState: 'watch',
                states: {
                    watch: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    },
                    spellPrepare: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    }
                }
            })
        });

        expect(machine.state).toBe<BState>('watch');
    });

    it('should change state on correct event', () => {

        const machine = BStateMachine(seedMapManager('fake'), {
            battleStateSchemaCreator: () => ({
                initialState: 'watch',
                states: {
                    watch: {
                        engineCreator: () => ({
                            stop() { }
                        }),
                        on: {
                            [BattleStateSpellPrepareAction.type]: [ {
                                target: 'spellPrepare',
                            } ]
                        }
                    },
                    spellPrepare: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    },
                }
            })
        });

        StoreTest.dispatch(BattleStateSpellPrepareAction({
            spellType: 'move'
        }));

        expect(machine.state).toBe<BState>('spellPrepare');
    });

    it('should change state with correct condition', () => {

        const machine = BStateMachine(seedMapManager('fake'), {
            battleStateSchemaCreator: () => ({
                initialState: 'watch',
                states: {
                    watch: {
                        engineCreator: () => ({
                            stop() { }
                        }),
                        on: {
                            [BattleStateSpellPrepareAction.type]: [ {
                                target: 'spellPrepare',
                                cond: () => true
                            } ]
                        }
                    },
                    spellPrepare: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    },
                }
            })
        });

        StoreTest.dispatch(BattleStateSpellPrepareAction({
            spellType: 'move'
        }));

        expect(machine.state).toBe<BState>('spellPrepare');
    });

    it('should not change state with incorrect condition', () => {

        const machine = BStateMachine(seedMapManager('fake'), {
            battleStateSchemaCreator: () => ({
                initialState: 'watch',
                states: {
                    watch: {
                        engineCreator: () => ({
                            stop() { }
                        }),
                        on: {
                            [BattleStateSpellPrepareAction.type]: [ {
                                target: 'spellPrepare',
                                cond: () => false
                            } ]
                        }
                    },
                    spellPrepare: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    },
                }
            })
        });

        StoreTest.dispatch(BattleStateSpellPrepareAction({
            spellType: 'move'
        }));

        expect(machine.state).toBe<BState>('watch');
    });

    it('should not change state without corresponding trigger', () => {

        const machine = BStateMachine(seedMapManager('fake'), {
            battleStateSchemaCreator: () => ({
                initialState: 'watch',
                states: {
                    watch: {
                        engineCreator: () => ({
                            stop() { }
                        }),
                        on: {
                        }
                    },
                    spellPrepare: {
                        engineCreator: () => ({
                            stop() { }
                        })
                    },
                }
            })
        });

        StoreTest.dispatch(BattleStateSpellPrepareAction({
            spellType: 'move'
        }));

        expect(machine.state).toBe<BState>('watch');
    });

    // describe('from "watch"', () => {

    //     it('should not pass to "idle" on TURN-START when not own turn', () => {

    //         fillBattleData(false);

    //         stateMachine = BStateMachine(battleData);

    //         stateMachine.send('TURN-START');

    //         expect(stateMachine.state).not.toBe<BState>('idle');
    //     });

    //     it('should pass to "idle" on TURN-START', () => {

    //         fillBattleData(true);

    //         stateMachine = BStateMachine(battleData);

    //         stateMachine.send('TURN-START');

    //         expect(stateMachine.state).toBe<BState>('idle');
    //     });

    //     it('should not pass to "spellLaunch" on SPELL-NOTIFY if no one plays', () => {

    //         fillBattleData(false, (now, actionTime) => now - actionTime);

    //         stateMachine = BStateMachine(battleData);

    //         stateMachine.send('SPELL-NOTIFY');

    //         expect(stateMachine.state).not.toBe<BState>('spellLaunch');
    //     });

    //     it('should pass to "spellLaunch" on SPELL-NOTIFY', () => {

    //         fillBattleData(false);

    //         stateMachine = BStateMachine(battleData);

    //         stateMachine.send('SPELL-NOTIFY');

    //         expect(stateMachine.state).toBe<BState>('spellLaunch');
    //     });

    //     it.each<BStateEvents>(
    //         [ 'RESET', 'SPELL-LAUNCH', 'SPELL-PREPARE', 'TURN-END' ]
    //     )('should not handle %s event', event => {

    //         stateMachine = BStateMachine(battleData);

    //         stateMachine.send(event);

    //         expect(stateMachine.state).toBe<BState>('watch');
    //     });

    // });

    // describe('from "idle"', () => {

    //     beforeEach(() => {
    //         fillBattleData(true);
    //     });

    //     it('should pass to "spellPrepare" on SPELL-PREPARE', () => {

    //         stateMachine = BStateMachine(battleData);
    //         stateMachine.send('TURN-START');

    //         stateMachine.send('SPELL-PREPARE');

    //         expect(stateMachine.state).toBe<BState>('spellPrepare');
    //     });

    //     it('should pass to "watch" on TURN-END', () => {

    //         stateMachine = BStateMachine(battleData);
    //         stateMachine.send('TURN-START');

    //         stateMachine.send('TURN-END');

    //         expect(stateMachine.state).toBe<BState>('watch');
    //     });

    //     it.each<BStateEvents>(
    //         [ 'RESET', 'SPELL-LAUNCH', 'SPELL-NOTIFY', 'TURN-START' ]
    //     )('should not handle %s event', event => {

    //         stateMachine = BStateMachine(battleData);
    //         stateMachine.send('TURN-START');

    //         stateMachine.send(event);

    //         expect(stateMachine.state).toBe<BState>('idle');
    //     });
    // });

});
