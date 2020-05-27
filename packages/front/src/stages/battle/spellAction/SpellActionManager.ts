import { assertIsDefined, ConfirmSAction, NotifySAction, Position, SpellActionSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { BattleStateSpellLaunchAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { getSpellLaunchFn as GetterSpellLaunchFn } from '../engine/spellMapping';
import { Spell } from '../entities/spell/Spell';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { SpellActionTimer } from './SpellActionTimer';

export interface SpellAction {
    spell: Spell<'future'>;
    position: Position;
    actionArea: Position[];
}

export interface SpellActionManager {
}

interface Dependencies {
    spellActionTimerCreator: typeof SpellActionTimer;
    getSpellLaunchFn: typeof GetterSpellLaunchFn;
}

const assertSameHash = (hash1: string, hash2: string): void | never => {
    if (hash1 !== hash2) {
        throw new Error(`Hashes should be equal [${hash1}]<->[${hash2}].
        There is an inconsistency front<->back.`);
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

    const { spellActionSnapshotList, characters } = serviceBattleData('future');

    const { onAction, onMessageAction } = serviceEvent();
    const { dispatchCommit } = serviceDispatch({
        dispatchCommit: (time: number) => BattleCommitAction({
            time
        })
    });

    const getLastSnapshot = (): SpellActionSnapshot | undefined => spellActionSnapshotList[ spellActionSnapshotList.length - 1 ];

    const getSnapshotEndTime = ({ startTime, duration }: SpellActionSnapshot) => startTime + duration;

    const onSpellAction = (action: SpellAction, startTime: number, fromNotify: boolean) => {
        const { spell, position } = action;

        const { duration } = spell.feature;

        const spellLaunchFn = getSpellLaunchFn(spell.staticData.type);

        spellLaunchFn(action, characters);

        dispatchCommit(startTime + duration);

        const { battleHash } = serviceBattleData('future');

        const snap: SpellActionSnapshot = {
            startTime,
            characterId: spell.character.id,
            duration,
            spellId: spell.id,
            position,
            actionArea: action.actionArea,
            battleHash,
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
            onSpellAction(spellAction, nextStartTime, false);
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

    onAction(BattleStateSpellLaunchAction, payload => spellActionLaunch(payload.spellActions));

    onAction(BattleStateTurnStartAction, clearSnapshotList);

    onAction(BattleStateTurnEndAction, rollbackCurrentAndFuture);

    onMessageAction<ConfirmSAction>('confirm', ({ isOk, lastCorrectHash }) => {
        if (!isOk) {
            onRollback(lastCorrectHash);
        }
    });

    onMessageAction<NotifySAction>('notify', ({ spellActionSnapshot: {
        characterId, spellId, position, actionArea, startTime, battleHash
    } }) => {

        const { characters } = serviceBattleData('future');

        const character = characters.find(c => c.id === characterId);

        assertIsDefined(character);

        const spell = character.spells.find(s => s.id === spellId);

        assertIsDefined(spell);

        const spellAction: SpellAction = {
            spell,
            position,
            actionArea
        };

        onSpellAction(spellAction, startTime, true);

        assertSameHash(getLastSnapshot()!.battleHash, battleHash);
    });

    return {};
};
