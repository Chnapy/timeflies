import { Position, SpellActionSnapshot } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceEvent } from '../../../services/serviceEvent';
import { Spell } from '../entities/Spell';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { BattleCommitAction, SnapshotManager } from '../snapshot/SnapshotManager';
import { serviceNetwork } from '../../../services/serviceNetwork';

export interface BattleSpellLaunchAction extends IGameAction<'battle/spell/launch'> {
    spellActions: SpellAction[];
}

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

    onAction<BattleSpellLaunchAction>('battle/spell/launch', ({ spellActions }) => {
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
