import { Position, SpellActionSnapshot } from '@timeflies/shared';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { Spell } from '../entities/Spell';
import { BattleCommitAction, SnapshotManager } from '../snapshot/SnapshotManager';
import { BStateAction } from '../battleState/BattleStateSchema';

export interface SpellAction {
    spell: Spell;
    position: Position;
    beforeCommit: (action: SpellAction) => void;
}

export interface SpellActionManager {
}

export const SpellActionManager = (snapshotManager: SnapshotManager): SpellActionManager => {

    const snapshots: SpellActionSnapshot[] = [];

    const { onAction } = serviceEvent();
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
            spellId: spell.id,
            position,
            battleHash
        };

        sendSpellAction(snap);

        snapshots.push(snap);
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

    return {};
};
