import { assertIsDefined, SpellActionSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from './spell-action-manager-actions';


export interface SpellActionTimer {
    onAdd(snapshot: SpellActionSnapshot): void;
    onRemove(snapshotDeletedList: SpellActionSnapshot[], correctHash: string): void;
}

const assertSpellActionIsNotFuture = (snapshot: SpellActionSnapshot): void | never => {
    if (snapshot.startTime > Date.now()) {
        throw new Error(`Spell action snapshot [${snapshot.spellId}] should not be future:
        [now:${Date.now()}]<->[startTime:${snapshot.startTime}]`);
    }
}

export const SpellActionTimer = (): SpellActionTimer => {

    let currentSpellAction: SpellActionSnapshot | undefined;
    let timeout: NodeJS.Timeout | undefined;

    const network = serviceNetwork({
        sendSpellAction: (spellAction: SpellActionSnapshot) => ({
            type: 'battle/spellAction',
            spellAction
        })
    });

    const { spellActionSnapshotList } = serviceBattleData('future');

    const { dispatchStart, dispatchEnd } = serviceDispatch({
        dispatchStart: (snapshot: SpellActionSnapshot) => SpellActionTimerStartAction({
            spellActionSnapshot: snapshot
        }),
        dispatchEnd: (snapshot: SpellActionSnapshot, removed: boolean, correctHash: string) => SpellActionTimerEndAction({
            spellActionSnapshot: snapshot,
            removed,
            correctHash
        })
    })

    const startSpellAction = (snapshot: SpellActionSnapshot) => {

        assertSpellActionIsNotFuture(snapshot);

        currentSpellAction = snapshot;

        const { startTime, duration } = snapshot;

        const delta = Math.max(Date.now() - startTime, 0);

        timeout = setTimeout(endSpellAction, duration - delta);

        dispatchStart(snapshot);

        network.then(({ sendSpellAction }) => {
            sendSpellAction(snapshot);
        });
    };

    const clearSpellAction = () => {
        currentSpellAction = undefined;
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };

    const endSpellAction = () => {

        assertIsDefined(currentSpellAction);

        dispatchEnd(currentSpellAction, false, currentSpellAction.battleHash);

        const nextSnapshot = spellActionSnapshotList.find(s => s.startTime > currentSpellAction!.startTime);

        clearSpellAction();

        if (nextSnapshot) {
            startSpellAction(nextSnapshot);
        }
    };

    const removeSpellAction = (snapshot: SpellActionSnapshot, correctHash: string) => {

        dispatchEnd(snapshot, true, correctHash);

        clearSpellAction();
    };

    return {
        onAdd(snapshot) {
            if (currentSpellAction) {
                return;
            }

            startSpellAction(snapshot);
        },
        onRemove(snapshotDeletedList, correctHash) {

            const currentOrPassedSnapshot = snapshotDeletedList.find(({ startTime }) =>
                startTime <= Date.now()
            );

            if (currentOrPassedSnapshot) {
                removeSpellAction(currentOrPassedSnapshot, correctHash);
            }
        }
    };
};