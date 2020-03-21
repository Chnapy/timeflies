import { ConfirmSAction, Position, SpellActionSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { BStateAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { assertHashIsInSnapshotList, BattleCommitAction } from '../snapshot/SnapshotManager';
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

    const network = serviceNetwork({
        sendSpellAction: (spellAction: SpellActionSnapshot) => ({
            type: 'battle/spellAction',
            spellAction
        })
    });

    const getLastSnapshot = (): SpellActionSnapshot | undefined => spellActionSnapshotList[ spellActionSnapshotList.length - 1 ];

    const getSnapshotEndTime = ({ startTime, duration }: SpellActionSnapshot) => startTime + duration;

    const onSpellAction = (
        action: SpellAction,
        startTime: number,
        sendSpellAction: (snap: SpellActionSnapshot) => void
    ) => {
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

        sendSpellAction(snap);

        spellActionSnapshotList.push(snap);

        spellActionTimer.onAdd(snap);
    };

    const onRollback = (correctHash: string): void => {

        assertHashIsInSnapshotList(correctHash, spellActionSnapshotList);

        const deletedList: SpellActionSnapshot[] = [];

        while (
            getLastSnapshot()!.battleHash !== correctHash
        ) {
            const deleted = spellActionSnapshotList.pop()!;
            deletedList.push(deleted);
        }

        spellActionTimer.onRemove(deletedList, correctHash);
    };

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType === 'SPELL-LAUNCH') {

            const { spellActions } = action.payload;

            const lastSnapshot = getLastSnapshot();
            const now = Date.now();

            let nextStartTime = lastSnapshot
                ? Math.max(getSnapshotEndTime(lastSnapshot), now)
                : now;

            network.then(({ sendSpellAction }) => {

                spellActions.forEach(spellAction => {
                    onSpellAction(spellAction, nextStartTime, sendSpellAction);
                    nextStartTime += spellAction.spell.feature.duration;
                });

            });

        } else if (action.eventType === 'TURN-START') {

            spellActionSnapshotList.splice(0, Infinity);

        } else if (action.eventType === 'TURN-END') {

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
        }

    });

    onMessageAction<ConfirmSAction>('confirm', ({ isOk, lastCorrectHash }) => {
        if (!isOk) {
            onRollback(lastCorrectHash);
        }
        // else {
        //     assertThenGet(
        //         spellActionSnapshotList.find(({ validated, battleHash }) =>
        //             !validated && battleHash === lastCorrectHash
        //         ), assertIsDefined
        //     ).validated = true;
        // }
    });

    return {};
};
