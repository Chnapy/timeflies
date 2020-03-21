import { assertIsDefined, SpellActionSnapshot } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceBattleData } from '../../../services/serviceBattleData';

export interface SpellActionTimerStartAction extends IGameAction<'battle/spell-action/start'> {
    spellActionSnapshot: SpellActionSnapshot;
}

export interface SpellActionTimerEndAction extends IGameAction<'battle/spell-action/end'> {
    removed: boolean;
    correctHash: string;
}

export type SpellActionTimerAction =
    | SpellActionTimerStartAction
    | SpellActionTimerEndAction;

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

    const { spellActionSnapshotList } = serviceBattleData('future');

    const { dispatchStart, dispatchEnd } = serviceDispatch({
        dispatchStart: (snapshot: SpellActionSnapshot): SpellActionTimerStartAction => ({
            type: 'battle/spell-action/start',
            spellActionSnapshot: snapshot
        }),
        dispatchEnd: (removed: boolean, correctHash: string): SpellActionTimerEndAction => ({
            type: 'battle/spell-action/end',
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
    };

    const clearSpellAction = () => {
        currentSpellAction = undefined;
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };

    const endSpellAction = () => {

        assertIsDefined(currentSpellAction)

        dispatchEnd(false, currentSpellAction.battleHash);

        const nextSnapshot = spellActionSnapshotList.find(s => s.startTime > currentSpellAction!.startTime);

        clearSpellAction();

        if(nextSnapshot) {
            startSpellAction(nextSnapshot);
        }
    };

    const removeSpellAction = (correctHash: string) => {

        dispatchEnd(true, correctHash);

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
                removeSpellAction(correctHash);
            }
        }
    };
};