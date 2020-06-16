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

    const startSpellAction = (snapshot: SpellActionSnapshot, fromNotify: boolean) => {

        assertSpellActionIsNotFuture(snapshot);

        const { startTime, duration } = snapshot;

        const delta = Math.max(Date.now() - startTime, 0);

        timeout = setTimeout(() => endSpellAction(snapshot, fromNotify), duration - delta);

        dispatchStart(snapshot);

        if (!fromNotify) {
            sendSpellAction(snapshot);
        }
    };

    const cancelTimeout = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };

    const endSpellAction = (currentSpellAction: SpellActionSnapshot, fromNotify: boolean) => {

        dispatchEnd(currentSpellAction, false, currentSpellAction.battleHash);

        const spellActionSnapshotList = extractSpellActionSnapshotList();

        const nextSnapshot = spellActionSnapshotList.find(s => s.startTime > currentSpellAction!.startTime);

        cancelTimeout();

        if (nextSnapshot) {
            startSpellAction(nextSnapshot, fromNotify);
        }
    };

    const removeSpellAction = (snapshot: SpellActionSnapshot, correctHash: string) => {

        cancelTimeout();

        dispatchEnd(snapshot, true, correctHash);
    };

    return {
        onAdd(startTime: number, fromNotify: boolean) {
            const snapshot = extractSpellActionSnapshotList().find(s => s.startTime === startTime)!;
            startSpellAction(snapshot, fromNotify);
        },
        onRemove(snapshotDeletedList: SpellActionSnapshot[], correctHash: string) {

            cancelTimeout();

            const currentOrPassedSnapshot = snapshotDeletedList.find(({ startTime }) =>
                startTime <= Date.now()
            );

            if (currentOrPassedSnapshot) {
                removeSpellAction(currentOrPassedSnapshot, correctHash);
            }
        }
    };
};