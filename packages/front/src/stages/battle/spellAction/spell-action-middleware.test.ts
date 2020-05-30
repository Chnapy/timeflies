import { MiddlewareAPI } from '@reduxjs/toolkit';
import { seedSpellActionSnapshot, TimerTester } from '@timeflies/shared';
import { BattleStateSpellLaunchAction, BattleStateTurnEndAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { SpellActionCancelAction, SpellActionLaunchAction } from './spell-action-actions';
import { spellActionMiddleware } from './spell-action-middleware';
import { SpellActionState } from './spell-action-reducer';
import { SpellActionTimer } from './SpellActionTimer';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';

describe('# spell-action-middleware', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    const init = () => {

        const futureCharacter = seedCharacter('fake', {
            period: 'future',
            id: '1',
            player: null
        });

        const spell = seedSpell('fake', {
            period: 'future',
            id: 's1',
            character: futureCharacter,
            type: 'move',
            initialFeatures: {
                duration: 200
            }
        });

        const api: MiddlewareAPI = {
            getState: jest.fn(),
            dispatch: jest.fn()
        };

        const next = jest.fn();

        const timer: SpellActionTimer = {
            onAdd: jest.fn(),
            onRemove: jest.fn()
        };

        const state: SpellActionState = {
            spellActionSnapshotList: [],
            currentSpellAction: null
        };

        return {
            futureCharacter,
            spell,
            api,
            next,
            timer,
            state
        };
    };

    describe('on spell action', () => {

        it('should dispatch launch action with snapshot list', () => {
            const { futureCharacter, spell, api, next, timer, state } = init();

            const action = BattleStateSpellLaunchAction({
                spellActions: [
                    {
                        spell,
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ]
                    }
                ]
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenCalledWith(
                SpellActionLaunchAction({
                    spellActionSnapshotList: [ {
                        startTime: timerTester.now,
                        duration: 200,
                        battleHash: '-hash-',
                        characterId: '1',
                        spellId: 's1',
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ],
                    } ]
                })
            );
        });

        it('should dispatch commit for each spell', () => {
            const { futureCharacter, spell, api, next, timer, state } = init();

            const action = BattleStateSpellLaunchAction({
                spellActions: [
                    {
                        spell,
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ]
                    },
                    {
                        spell,
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ]
                    }
                ]
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenNthCalledWith(2, BattleCommitAction({
                time: expect.any(Number)
            }));
        });

        it('should notify timer to first spell added', () => {
            const { futureCharacter, spell, api, next, timer, state } = init();

            const action = BattleStateSpellLaunchAction({
                spellActions: [
                    {
                        spell,
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ]
                    },
                    {
                        spell,
                        position: { x: -1, y: -1 },
                        actionArea: [ { x: -1, y: -1 } ]
                    }
                ]
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(timer.onAdd).toHaveBeenNthCalledWith(1, {
                startTime: timerTester.now,
                duration: 200,
                battleHash: '-hash-',
                characterId: '1',
                spellId: 's1',
                position: { x: -1, y: -1 },
                actionArea: [ { x: -1, y: -1 } ],
            });
        });
    });

    describe('on turn end action', () => {

        it('should return turn end action', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                })
            );

            const action = BattleStateTurnEndAction();

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(next).toHaveBeenNthCalledWith(1, BattleStateTurnEndAction());
        });

        it('should dispatch spell canceled action with new snapshot list', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 1000,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 2000,
                    duration: 1000,
                })
            );

            timerTester.advanceBy(1200);

            const action = BattleStateTurnEndAction();

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenNthCalledWith(1, SpellActionCancelAction({
                spellActionSnapshotsValids: state.spellActionSnapshotList.slice(0, 1)
            }));
        });

        it('should notify timer of removed snapshots', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 1000,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 2000,
                    duration: 1000,
                })
            );

            timerTester.advanceBy(1200);

            const action = BattleStateTurnEndAction();

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(timer.onRemove).toHaveBeenNthCalledWith(1,
                expect.arrayContaining(state.spellActionSnapshotList.slice(1)),
                '-hash-current-'
            );
        });
    });

    describe('on confirm action', () => {

        it('should return confirm action', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                })
            );

            const action = ReceiveMessageAction({
                type: 'confirm',
                isOk: true,
                lastCorrectHash: '',
                sendTime: -1
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(next).toHaveBeenNthCalledWith(1, action);
        });

        it('should not dispatch on OK', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                })
            );

            const action = ReceiveMessageAction({
                type: 'confirm',
                isOk: true,
                lastCorrectHash: '',
                sendTime: -1
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).not.toHaveBeenCalled();
        });

        it('should dispatch spell cancel on KO', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 1000,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 2000,
                    duration: 1000,
                })
            );

            timerTester.advanceBy(1200);

            const action = ReceiveMessageAction({
                type: 'confirm',
                isOk: false,
                lastCorrectHash: '-correct-hash-',
                sendTime: -1
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenNthCalledWith(1, SpellActionCancelAction({
                spellActionSnapshotsValids: state.spellActionSnapshotList.slice(0, 1)
            }));
        });

        it('should notify timer of removed snapshots and correct hash', () => {

            const { futureCharacter, api, next, timer, state } = init();

            state.spellActionSnapshotList.push(
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 1000,
                    duration: 1000,
                }),
                seedSpellActionSnapshot('s1', {
                    startTime: timerTester.now + 2000,
                    duration: 1000,
                })
            );

            timerTester.advanceBy(1200);

            const action = ReceiveMessageAction({
                type: 'confirm',
                isOk: false,
                lastCorrectHash: '-correct-hash-',
                sendTime: -1
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-future-',
                extractCurrentHash: () => '-hash-current-',
                extractState: () => state
            })(api)(next)(action);

            expect(timer.onRemove).toHaveBeenNthCalledWith(1,
                expect.arrayContaining(state.spellActionSnapshotList.slice(1)),
                '-correct-hash-'
            );
        });
    });

    describe('on notify action', () => {

        it('should dispatch launch action with snapshot', () => {
            const { futureCharacter, api, next, timer, state } = init();

            const snapshot = seedSpellActionSnapshot(futureCharacter.spells[ 0 ].id, {
                startTime: timerTester.now,
                duration: 200,
                battleHash: '-hash-',
                characterId: futureCharacter.id,
            });

            const action = ReceiveMessageAction({
                type: 'notify',
                sendTime: -1,
                spellActionSnapshot: snapshot
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenCalledWith(
                SpellActionLaunchAction({
                    spellActionSnapshotList: [ snapshot ]
                })
            );
        });

        it('should dispatch commit', () => {
            const { futureCharacter, api, next, timer, state } = init();

            const snapshot = seedSpellActionSnapshot(futureCharacter.spells[ 0 ].id, {
                startTime: timerTester.now,
                duration: 200,
                battleHash: '-hash-',
                characterId: futureCharacter.id,
            });

            const action = ReceiveMessageAction({
                type: 'notify',
                sendTime: -1,
                spellActionSnapshot: snapshot
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(api.dispatch).toHaveBeenCalledWith(BattleCommitAction({
                time: expect.any(Number)
            }));
        });

        it('should notify timer', () => {
            const { futureCharacter, api, next, timer, state } = init();

            const snapshot = seedSpellActionSnapshot(futureCharacter.spells[ 0 ].id, {
                startTime: timerTester.now,
                duration: 200,
                battleHash: '-hash-',
                characterId: futureCharacter.id,
            });

            const action = ReceiveMessageAction({
                type: 'notify',
                sendTime: -1,
                spellActionSnapshot: snapshot
            });

            spellActionMiddleware({
                createSpellActionTimer: () => timer,
                extractFutureCharacters: () => [ futureCharacter ],
                extractFutureHash: () => '-hash-',
                extractCurrentHash: () => '-hash-',
                extractState: () => state
            })(api)(next)(action);

            expect(timer.onAdd).toHaveBeenNthCalledWith(1, snapshot);
        });
    });
});
