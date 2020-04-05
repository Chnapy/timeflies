import { ConfirmSAction, Position, SpellActionSnapshot, NotifySAction, assertIsDefined } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/spell/Spell';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionTimer } from './SpellActionTimer';
import { getSpellLaunchFn as GetterSpellLaunchFn } from '../engine/spellMapping';

export interface SpellAction {
    spell: Spell;
    position: Position;
}

export interface SpellActionManager {
}

interface Dependencies {
    spellActionTimerCreator: typeof SpellActionTimer;
    getSpellLaunchFn: typeof GetterSpellLaunchFn;
}

const assertSameHash = (hash1: string, hash2: string): void | never => {
    if (hash1 !== hash2) {
        throw new Error(`Hashs should be equal [${hash1}]<->[${hash2}].
        There is an inconsistence front<->back.`);
    }
};

export const SpellActionManager = (
    {
        spellActionTimerCreator,
        getSpellLaunchFn
    }: Dependencies = {
            spellActionTimerCreator: SpellActionTimer,
            getSpellLaunchFn: GetterSpellLaunchFn
        }
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
        const { spell, position } = action;

        const { duration } = spell.feature;

        const spellLaunchFn = getSpellLaunchFn(spell.staticData.type);

        spellLaunchFn(action);

        dispatchCommit(startTime + duration);

        const { battleHash } = serviceBattleData('future');

        const snap: SpellActionSnapshot = {
            startTime,
            characterId: spell.character.id,
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

    onMessageAction<NotifySAction>('notify', ({ spellActionSnapshot: {
        spellId, position, startTime, battleHash
    } }) => {

        const { globalTurn } = serviceBattleData('cycle');

        assertIsDefined(globalTurn);

        const { character } = globalTurn.currentTurn;

        const spell = character.spells.find(s => s.id === spellId);

        assertIsDefined(spell);

        const spellAction: SpellAction = {
            spell,
            position
        };

        onSpellAction(spellAction, startTime);

        assertSameHash(getLastSnapshot()!.battleHash, battleHash);
    });

    return {};
};
