import { SpellActionSnapshot, TimerTester } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction } from '../../../socket/wsclient-actions';
import { StoreTest } from '../../../StoreTest';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from './spell-action-actions';
import { SpellActionTimer } from './SpellActionTimer';

describe('# SpellActionTimer', () => {

    const timerTester = new TimerTester();

    const getSnapshot = (partial: Partial<SpellActionSnapshot> = {}): SpellActionSnapshot => ({
        battleHash: '',
        duration: 200,
        position: { x: -1, y: -1 },
        actionArea: [ { x: -1, y: -1 } ],
        characterId: '1',
        spellId: '',
        startTime: timerTester.now,
        ...partial
    });

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
            battle: {
                future: {
                    spellActionSnapshotList: [],
                }
            } as any
        });

        const timer = SpellActionTimer();

        const snapshot = getSnapshot({ startTime: timerTester.now + 100 });

        expect(() => timer.onAdd(snapshot)).toThrowError();
    });

    it('should launch current spell action and send message', async () => {

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList: [],
                }
            } as any
        });

        const timer = SpellActionTimer();

        const snapshot = getSnapshot({ startTime: timerTester.now });

        timer.onAdd(snapshot);

        await serviceNetwork({});

        expect(StoreTest.getActions()).toEqual([
            SpellActionTimerStartAction({
                spellActionSnapshot: snapshot
            }),
            SendMessageAction({
                type: 'battle/spellAction',
                spellAction: snapshot
            })
        ]);
    });

    it('should end current spell on its end', () => {

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList: []
                }
            } as any
        });

        const timer = SpellActionTimer();

        const snapshot = getSnapshot({
            battleHash: '-hash-'
        });

        timer.onAdd(snapshot);

        timerTester.advanceBy(200);

        expect(
            StoreTest.getActions()
        ).toContainEqual(SpellActionTimerEndAction({
            removed: false,
            correctHash: '-hash-',
            spellActionSnapshot: snapshot
        }));
    });

    it('should remove current spell action on its end & launch the next one', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList
                }
            } as any
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timerTester.advanceBy(200);

        expect(
            StoreTest.getActions()
        ).toContainEqual(SpellActionTimerStartAction({
            spellActionSnapshot: spellActionSnapshotList[ 1 ]
        }));
    });

    it('should not end current spell action on future rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList
                }
            } as any
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timer.onRemove([
            spellActionSnapshotList[ 1 ]
        ], '-hash1-');

        expect(
            StoreTest.getActions().map(a => a.type)
        ).not.toContain<SpellActionTimerEndAction[ 'type' ]>('battle/spell-action/end');
    });

    it('should end current spell action on current rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList
                }
            } as any
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timer.onRemove([
            spellActionSnapshotList[ 0 ]
        ], '-hash0-');

        expect(
            StoreTest.getActions()
        ).toContainEqual(SpellActionTimerEndAction({
            removed: true,
            correctHash: '-hash0-',
            spellActionSnapshot: getSnapshot({ battleHash: '-hash1-' })
        }));
    });

    it('should end passed spell action on delayed rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        StoreTest.initStore({
            battle: {
                future: {
                    spellActionSnapshotList
                }
            } as any
        });

        const timer = SpellActionTimer();

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        spellActionSnapshotList.forEach(timer.onAdd);

        timerTester.advanceBy(300);

        StoreTest.clearActions();

        timer.onRemove([
            getSnapshot({
                battleHash: '-hash1-',
                startTime: timerTester.now - 300
            })
        ], '-hash0-');

        expect(
            StoreTest.getActions()
        ).toContainEqual(SpellActionTimerEndAction({
            removed: true,
            correctHash: '-hash0-',
            spellActionSnapshot: getSnapshot({
                battleHash: '-hash1-',
                startTime: timerTester.now - 300
            })
        }));
    });
});