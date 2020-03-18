import { ConfirmSAction, Position, SpellActionSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { BStateAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { BattleCommitAction, SnapshotManager, assertHashIsInSnapshotList } from '../snapshot/SnapshotManager';

export interface SpellAction {
    spell: Spell;
    position: Position;
    beforeCommit: (action: SpellAction) => void;
}

export interface SpellActionManager {
}

export const SpellActionManager = (snapshotManager: SnapshotManager): SpellActionManager => {

    const { spellActionSnapshotList } = serviceBattleData('future');

    const { onAction, onMessageAction } = serviceEvent();
    const { dispatchCommit } = serviceDispatch({
        dispatchCommit: (): BattleCommitAction => ({
            type: 'battle/commit'
        })
    });

    const network = serviceNetwork({
        sendSpellAction: (spellAction: SpellActionSnapshot) => ({
            type: 'battle/spellAction',
            spellAction
        })
    });

    const onSpellAction = (
        action: SpellAction,
        startTime: number,
        sendSpellAction: (snap: SpellActionSnapshot) => void
    ) => {
        const { spell, position, beforeCommit } = action;

        beforeCommit(action);

        dispatchCommit();

        const battleHash = snapshotManager.getLastHash();

        const snap: SpellActionSnapshot = {
            startTime,
            duration: spell.feature.duration,
            spellId: spell.id,
            position,
            battleHash
        };

        sendSpellAction(snap);

        spellActionSnapshotList.push(snap);
    };

    const onRollback = (correctHash: string): void => {

        assertHashIsInSnapshotList(correctHash, spellActionSnapshotList);

        while (
            spellActionSnapshotList[ spellActionSnapshotList.length - 1 ].battleHash !== correctHash
        ) {
            spellActionSnapshotList.pop();
        }
    };

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType !== 'SPELL-LAUNCH') {
            return;
        }

        const { spellActions } = action.payload;

        let nextStartTime = Date.now();

        network.then(({ sendSpellAction }) => {

            spellActions.forEach(spellAction => {
                onSpellAction(spellAction, nextStartTime, sendSpellAction);
                nextStartTime += spellAction.spell.feature.duration;
            });

        })

    });

    onMessageAction<ConfirmSAction>('confirm', ({ isOk, lastCorrectHash }) => {
        if (!isOk) {
            onRollback(lastCorrectHash);
        }
    });

    return {};
};
