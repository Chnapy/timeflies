import { ConfirmSAction, Position, SpellActionSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionTimer } from './SpellActionTimer';

export interface SpellAction {
    spell: Spell;
    position: Position;
    beforeCommit: (action: SpellAction) => void;
}

export interface SpellActionManager {
}

interface Dependencies {
    spellActionTimerCreator: typeof SpellActionTimer;
}

export const SpellActionManager = (
    { spellActionTimerCreator }: Dependencies = { spellActionTimerCreator: SpellActionTimer }
): SpellActionManager => {

    const spellActionTimer = spellActionTimerCreator();

    const { spellActionSnapshotList } = serviceBattleData('future');

    const { onAction, onMessageAction } = serviceEvent();
    const { dispatchCommit } = serviceDispatch({
        dispatchCommit: (time: number): BattleCommitAction => ({
            type: 'battle/commit',
            time
        })
    });

    const getLastSnapshot = (): SpellActionSnapshot | undefined => spellActionSnapshotList[ spellActionSnapshotList.length - 1 ];

    const getSnapshotEndTime = ({ startTime, duration }: SpellActionSnapshot) => startTime + duration;

    const onSpellAction = (action: SpellAction, startTime: number) => {
        const { spell, position, beforeCommit } = action;

        const { duration } = spell.feature;

        beforeCommit(action);

        dispatchCommit(startTime + duration);

        const { battleHash } = serviceBattleData('future');

        const snap: SpellActionSnapshot = {
            startTime,
            duration,
            spellId: spell.id,
            position,
            battleHash,
            validated: false
        };

        spellActionSnapshotList.push(snap);

        spellActionTimer.onAdd(snap);
    };

    const onRollback = (correctHash: string): void => {

        const deletedList: SpellActionSnapshot[] = [];

        while (
            spellActionSnapshotList.length
            && getLastSnapshot()!.battleHash !== correctHash
        ) {
            const deleted = spellActionSnapshotList.pop()!;
            deletedList.push(deleted);
        }

        spellActionTimer.onRemove(deletedList, correctHash);
    };

    const clearSnapshotList = () => {
        spellActionSnapshotList.splice(0, Infinity);
    };

    const spellActionLaunch = (spellActionList: SpellAction[]) => {

        const lastSnapshot = getLastSnapshot();
        const now = Date.now();

        let nextStartTime = lastSnapshot
            ? Math.max(getSnapshotEndTime(lastSnapshot), now)
            : now;

        spellActionList.forEach(spellAction => {
            onSpellAction(spellAction, nextStartTime);
            nextStartTime += spellAction.spell.feature.duration;
        });
    };

    const rollbackCurrentAndFuture = () => {

        const deletedList: SpellActionSnapshot[] = [];

        const now = Date.now();

        const willEndInFuture = (snapshot: SpellActionSnapshot | undefined) =>
            !!snapshot && getSnapshotEndTime(snapshot) > now;

        while (
            willEndInFuture(getLastSnapshot())
        ) {
            const deleted = spellActionSnapshotList.pop()!;
            deletedList.push(deleted);
        }

        const { battleHash } = serviceBattleData('current');

        spellActionTimer.onRemove(deletedList, battleHash);
    };

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType === 'SPELL-LAUNCH') {

            const { spellActions } = action.payload;

            spellActionLaunch(spellActions);

        } else if (action.eventType === 'TURN-START') {

            clearSnapshotList();

        } else if (action.eventType === 'TURN-END') {

            rollbackCurrentAndFuture();
        }

    });

    onMessageAction<ConfirmSAction>('confirm', ({ isOk, lastCorrectHash }) => {
        if (!isOk) {
            onRollback(lastCorrectHash);
        }
    });

    return {};
};
