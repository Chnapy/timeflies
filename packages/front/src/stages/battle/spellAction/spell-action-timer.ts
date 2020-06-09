import { Dispatch } from '@reduxjs/toolkit';
import { SpellActionSnapshot } from '@timeflies/shared';
import { SendMessageAction } from '../../../socket/wsclient-actions';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from './spell-action-actions';


export type SpellActionTimer = ReturnType<typeof SpellActionTimer>;

const assertSpellActionIsNotFuture = (snapshot: SpellActionSnapshot): void | never => {
    if (snapshot.startTime > Date.now()) {
        throw new Error(`Spell action snapshot [${snapshot.spellId}] should not be future:
        [now:${Date.now()}]<->[startTime:${snapshot.startTime}]`);
    }
};

type Dependencies = {
    extractSpellActionSnapshotList: () => SpellActionSnapshot[];
    dispatch: Dispatch;
};

export const SpellActionTimer = ({
    extractSpellActionSnapshotList,
    dispatch
}: Dependencies) => {

    let timeout: NodeJS.Timeout | undefined;

    const dispatchStart = (snapshot: SpellActionSnapshot) => dispatch(SpellActionTimerStartAction({
        spellActionSnapshot: snapshot
    }));

    const dispatchEnd = (snapshot: SpellActionSnapshot, removed: boolean, correctHash: string) => dispatch(SpellActionTimerEndAction({
        spellActionSnapshot: snapshot,
        removed,
        correctHash
    }));

    const sendSpellAction = (spellAction: SpellActionSnapshot) => dispatch(SendMessageAction({
        type: 'battle/spellAction',
        spellAction
    }));

    const startSpellAction = (snapshot: SpellActionSnapshot) => {

        assertSpellActionIsNotFuture(snapshot);

        // currentSpellAction = snapshot;

        const { startTime, duration } = snapshot;

        const delta = Math.max(Date.now() - startTime, 0);

        timeout = setTimeout(() => endSpellAction(snapshot), duration - delta);

        dispatchStart(snapshot);

        sendSpellAction(snapshot);
    };

    const cancelTimeout = () => {
        // currentSpellAction = undefined;
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };

    const endSpellAction = (currentSpellAction: SpellActionSnapshot) => {

        dispatchEnd(currentSpellAction, false, currentSpellAction.battleHash);

        const spellActionSnapshotList = extractSpellActionSnapshotList();

        const nextSnapshot = spellActionSnapshotList.find(s => s.startTime > currentSpellAction!.startTime);

        cancelTimeout();

        if (nextSnapshot) {
            startSpellAction(nextSnapshot);
        }
    };

    const removeSpellAction = (snapshot: SpellActionSnapshot, correctHash: string) => {

        dispatchEnd(snapshot, true, correctHash);

        cancelTimeout();
    };

    return {
        onAdd(startTime: number) {
            const snapshot = extractSpellActionSnapshotList().find(s => s.startTime === startTime)!;
            startSpellAction(snapshot);
        },
        onRemove(snapshotDeletedList: SpellActionSnapshot[], correctHash: string) {

            const currentOrPassedSnapshot = snapshotDeletedList.find(({ startTime }) =>
                startTime <= Date.now()
            );

            if (currentOrPassedSnapshot) {
                removeSpellAction(currentOrPassedSnapshot, correctHash);
            }
        }
    };
};