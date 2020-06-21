import { SpellActionSnapshot, TimerTester, createPosition, normalize } from '@timeflies/shared';
import { SendMessageAction } from '../../../socket/wsclient-actions';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from './spell-action-actions';
import { SpellActionTimer } from './spell-action-timer';

describe('# SpellActionTimer', () => {

    const timerTester = new TimerTester();

    const getSnapshot = (partial: Partial<SpellActionSnapshot> = {}): SpellActionSnapshot => ({
        battleHash: '',
        duration: 200,
        position: createPosition(-1, -1),
        actionArea: normalize([ createPosition(-1, -1) ]),
        characterId: '1',
        spellId: '',
        startTime: timerTester.now,
        ...partial
    });

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should not allow future spell action without current one playing', () => {

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => [ snapshot ],
            dispatch
        });

        const snapshot = getSnapshot({ startTime: timerTester.now + 100 });

        expect(() => timer.onAdd(snapshot.startTime, false)).toThrowError();
    });

    it('should launch current spell action and send message', () => {

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => [ snapshot ],
            dispatch
        });

        const snapshot = getSnapshot({ startTime: timerTester.now });

        timer.onAdd(snapshot.startTime, false);

        expect(dispatch).toHaveBeenNthCalledWith(1, SpellActionTimerStartAction({
            spellActionSnapshot: snapshot
        }));

        expect(dispatch).toHaveBeenNthCalledWith(2, SendMessageAction({
            type: 'battle/spellAction',
            spellAction: snapshot
        }));
    });

    it('should end current spell on its end', () => {

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => [ snapshot ],
            dispatch
        });

        const snapshot = getSnapshot({
            battleHash: '-hash-'
        });

        timer.onAdd(snapshot.startTime, false);

        timerTester.advanceBy(200);

        expect(dispatch).toHaveBeenCalledWith(SpellActionTimerEndAction({
            removed: false,
            correctHash: '-hash-',
            spellActionSnapshot: snapshot
        }));
    });

    it('should remove current spell action on its end & launch the next one', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => spellActionSnapshotList,
            dispatch
        });

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        timer.onAdd(spellActionSnapshotList[ 0 ].startTime, false);

        timerTester.advanceBy(200);

        expect(dispatch).toHaveBeenCalledWith(SpellActionTimerStartAction({
            spellActionSnapshot: spellActionSnapshotList[ 1 ]
        }));
    });

    it('should not end current spell action on future rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => spellActionSnapshotList,
            dispatch
        });

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        timer.onAdd(spellActionSnapshotList[ 0 ].startTime, false);

        timer.onRemove([
            spellActionSnapshotList[ 1 ]
        ], '-hash1-');

        expect(dispatch).not.toHaveBeenCalledWith(SpellActionTimerEndAction(expect.anything()));
    });

    it('should end current spell action on current rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => spellActionSnapshotList,
            dispatch
        });

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        timer.onAdd(spellActionSnapshotList[ 0 ].startTime, false);

        timer.onRemove([
            spellActionSnapshotList[ 0 ]
        ], '-hash0-');

        expect(dispatch).toHaveBeenCalledWith(SpellActionTimerEndAction({
            removed: true,
            correctHash: '-hash0-',
            spellActionSnapshot: getSnapshot({ battleHash: '-hash1-' })
        }));
    });

    it('should end passed spell action on delayed rollback', () => {

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const dispatch = jest.fn();

        const timer = SpellActionTimer({
            extractSpellActionSnapshotList: () => spellActionSnapshotList,
            dispatch
        });

        spellActionSnapshotList.push(
            getSnapshot({ battleHash: '-hash1-' }),
            getSnapshot({
                battleHash: '-hash2-',
                startTime: timerTester.now + 200
            })
        );

        timer.onAdd(spellActionSnapshotList[ 0 ].startTime, false);

        timerTester.advanceBy(300);

        timer.onRemove([
            getSnapshot({
                battleHash: '-hash1-',
                startTime: timerTester.now - 300
            })
        ], '-hash0-');

        expect(dispatch).toHaveBeenCalledWith(SpellActionTimerEndAction({
            removed: true,
            correctHash: '-hash0-',
            spellActionSnapshot: getSnapshot({
                battleHash: '-hash1-',
                startTime: timerTester.now - 300
            })
        }));
    });
});