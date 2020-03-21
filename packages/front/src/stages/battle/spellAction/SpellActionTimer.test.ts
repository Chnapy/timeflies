import { StoreTest } from '../../../StoreTest';
import { SpellActionTimer, SpellActionTimerStartAction, SpellActionTimerEndAction } from './SpellActionTimer';
import { TimerTester, SpellActionSnapshot, SpellActionCAction } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction } from '../../../socket/WSClient';

describe('# SpellActionTimer', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
        StoreTest.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
        StoreTest.afterTest();
    });

    it('should not allow future spell action without current one playing', () => {

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList: [],
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        const snapshot: SpellActionSnapshot = {
            battleHash: '',
            duration: 200,
            position: { x: -1, y: -1 },
            spellId: '',
            startTime: timerTester.now + 100,
            validated: false
        };

        expect(() => timer.onAdd(snapshot)).toThrowError();
    });

    it('should launch current spell action and send message', async () => {

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList: [],
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        const snapshot: SpellActionSnapshot = {
            battleHash: '',
            duration: 200,
            position: { x: -1, y: -1 },
            spellId: '',
            startTime: timerTester.now,
            validated: false
        };

        timer.onAdd(snapshot);

        await serviceNetwork({});
        
        expect(StoreTest.getActions()).toEqual<[
            SpellActionTimerStartAction, SendMessageAction<SpellActionCAction>
        ]>([
            {
            type: 'battle/spell-action/start',
            spellActionSnapshot: snapshot
        },
        {
            type: 'message/send',
            message: {
                type: 'battle/spellAction' as const,
                spellAction: {
                    battleHash: '',
                    duration: 200,
                    position: { x: -1, y: -1 },
                    spellId: '',
                    startTime: timerTester.now,
                    validated: false
                }
            }
        }
    ]);
    });

    it('should end current spell on its end', () => {

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList: []
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        const snapshot: SpellActionSnapshot = {
            battleHash: '-hash-',
            duration: 200,
            position: { x: -1, y: -1 },
            spellId: '',
            startTime: timerTester.now,
            validated: false
        };

        timer.onAdd(snapshot);

        timerTester.advanceBy(200);
        
        expect(
            StoreTest.getActions()
        ).toContainEqual<SpellActionTimerEndAction>({
            type: 'battle/spell-action/end',
            removed: false,
            correctHash: '-hash-'
        });
    });

    it('should remove current spell action on its end & launch the next one', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];
        
        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            },
            {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now + 200,
                validated: false
            }
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timerTester.advanceBy(200);
        
        expect(
            StoreTest.getActions()
        ).toContainEqual<SpellActionTimerStartAction>({
            type: 'battle/spell-action/start',
            spellActionSnapshot: {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            }
        });
    });

    it('should not end current spell action on future rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];
        
        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            },
            {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now + 200,
                validated: false
            }
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timer.onRemove([
            {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now + 200,
                validated: false
            }
        ], '-hash1-');
        
        expect(
            StoreTest.getActions().map(a => a.type)
        ).not.toContain<SpellActionTimerEndAction['type']>('battle/spell-action/end');
    });

    it('should end current spell action on current rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];
        
        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            },
            {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now + 200,
                validated: false
            }
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timer.onRemove([
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            }
        ], '-hash0-');
        
        expect(
            StoreTest.getActions()
        ).toContainEqual<SpellActionTimerEndAction>({
            type: 'battle/spell-action/end',
            removed: true,
            correctHash: '-hash0-'
        });
    });

    it('should end passed spell action on delayed rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];
        
        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList
                    }
                } as any
            }
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now,
                validated: false
            },
            {
                battleHash: '-hash2-',
                duration: 300,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now + 200,
                validated: false
            }
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timerTester.advanceBy(300);

        timer.onRemove([
            {
                battleHash: '-hash1-',
                duration: 200,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: timerTester.now - 300,
                validated: false
            }
        ], '-hash0-');
        
        expect(
            StoreTest.getActions()
        ).toContainEqual<SpellActionTimerEndAction>({
            type: 'battle/spell-action/end',
            removed: true,
            correctHash: '-hash0-'
        });
    });
});