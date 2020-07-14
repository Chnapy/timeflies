import { Dispatch } from '@reduxjs/toolkit';
import { SpellActionSnapshot, WaitTimeoutPromise } from '@timeflies/shared';
import { SendMessageAction } from '../../../socket/wsclient-actions';
import { Batch, createActionBatch } from '../../../store/create-action-batch';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from './spell-action-actions';
import { waitTimeoutPool } from '../../../wait-timeout-pool';


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

    let timeout: WaitTimeoutPromise<unknown> | undefined;

    const differEndSpell = (snapshot: SpellActionSnapshot, fromNotify: boolean): void => {

        const { startTime, duration } = snapshot;

        const delta = Math.max(Date.now() - startTime, 0);

        timeout = waitTimeoutPool.createTimeout(duration - delta)
            .onCompleted(async () => {

                const batcher = createActionBatch();

                const { endSpellAction } = prepareBatch(batcher.batch);

                endSpellAction(snapshot, fromNotify);

                return batcher.dispatchWith(dispatch);
            });
    };

    const prepareBatch = (batch: Batch) => {

        const startSpellAction = (snapshot: SpellActionSnapshot, fromNotify: boolean) => {

            assertSpellActionIsNotFuture(snapshot);

            differEndSpell(snapshot, fromNotify);

            batch(SpellActionTimerStartAction({
                spellActionSnapshot: snapshot
            }));

            if (!fromNotify) {
                batch(SendMessageAction({
                    type: 'battle/spellAction',
                    spellAction: snapshot
                }));
            }
        };

        const cancelTimeout = () => {
            if (timeout) {
                timeout.cancel();
                timeout = undefined;
            }
        };

        const endSpellAction = (currentSpellAction: SpellActionSnapshot, fromNotify: boolean) => {

            batch(SpellActionTimerEndAction({
                spellActionSnapshot: currentSpellAction,
                removed: false,
                correctHash: currentSpellAction.battleHash
            }));

            const spellActionSnapshotList = extractSpellActionSnapshotList();

            const nextSnapshot = spellActionSnapshotList.find(s => s.startTime > currentSpellAction!.startTime);

            cancelTimeout();

            if (nextSnapshot) {
                startSpellAction(nextSnapshot, fromNotify);
            }
        };

        const removeSpellAction = (snapshot: SpellActionSnapshot, correctHash: string) => {

            cancelTimeout();

            batch(SpellActionTimerEndAction({
                spellActionSnapshot: snapshot,
                removed: true,
                correctHash
            }));
        };

        return {
            startSpellAction,
            cancelTimeout,
            endSpellAction,
            removeSpellAction
        };
    };

    return (batch: Batch) => ({
        onAdd(startTime: number, fromNotify: boolean) {
            const snapshot = extractSpellActionSnapshotList().find(s => s.startTime === startTime)!;

            const { startSpellAction } = prepareBatch(batch);

            startSpellAction(snapshot, fromNotify);
        },
        onRemove(snapshotDeletedList: SpellActionSnapshot[], correctHash: string) {

            const { cancelTimeout, removeSpellAction } = prepareBatch(batch);

            cancelTimeout();

            const currentOrPassedSnapshot = snapshotDeletedList.find(({ startTime }) =>
                startTime <= Date.now()
            );

            if (currentOrPassedSnapshot) {
                removeSpellAction(currentOrPassedSnapshot, correctHash);
            }
        },
        getTimeout: () => timeout
    });
};