import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { assertIsDefined, getLast, SpellActionSnapshot } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { BattleStateSpellLaunchAction, BattleStateTurnEndAction } from '../battleState/battle-state-actions';
import { Character } from '../entities/character/Character';
import { Spell } from '../entities/spell/Spell';
import { SnapshotState } from '../snapshot/snapshot-reducer';
import { SpellActionCancelAction, SpellActionLaunchAction } from './spell-action-actions';
import { SpellAction } from './spell-action-reducer';
import { SpellActionTimer } from './spell-action-timer';

type Dependencies<S> = {
    extractState: (getState: () => S) => SnapshotState;
    extractFutureCharacters: (getState: () => S) => Character<'future'>[];
    extractFutureSpells: (getState: () => S) => Spell<'future'>[];
    extractFutureHash: (getState: () => S) => string;
    extractCurrentHash: (getState: () => S) => string;
    createSpellActionTimer?: typeof SpellActionTimer;
};

const getSnapshotEndTime = ({ startTime, duration }: SpellActionSnapshot) => startTime + duration;

export const spellActionMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    extractState,
    extractFutureCharacters,
    extractFutureSpells,
    extractFutureHash,
    extractCurrentHash,
    createSpellActionTimer = SpellActionTimer
}) => api => next => {

    const spellActionTimer = createSpellActionTimer({
        extractSpellActionSnapshotList: () => extractState(api.getState).spellActionSnapshotList,
        dispatch: api.dispatch
    });

    const cancelCurrentAndNextSpells = (lastCorrectHash: string) => {

        const { spellActionSnapshotList } = extractState(api.getState);

        const spellActionSnapshotsValids = [ ...spellActionSnapshotList ];

        const toRemoveList: SpellActionSnapshot[] = [];

        const now = Date.now();

        const willEndInFuture = (snapshot: SpellActionSnapshot | undefined) =>
            !!snapshot && getSnapshotEndTime(snapshot) > now;

        while (
            willEndInFuture(getLast(spellActionSnapshotsValids))
        ) {
            toRemoveList.push(
                spellActionSnapshotsValids.pop()!
            );
        }

        if (toRemoveList.length) {
            api.dispatch(SpellActionCancelAction({
                spellActionSnapshotsValids
            }));
        }

        spellActionTimer.onRemove(toRemoveList, lastCorrectHash);
    };

    return (action: AnyAction) => {

        if (BattleStateSpellLaunchAction.match(action)) {

            const { spellActions } = action.payload;

            const spellActionState = extractState(api.getState);
            const hadCurrentSpellAction = !!spellActionState.currentSpellAction;

            const lastSnapshot = getLast(spellActionState.spellActionSnapshotList);
            const now = Date.now();

            let startTime = lastSnapshot
                ? Math.max(getSnapshotEndTime(lastSnapshot), now)
                : now;

            // const spellSnapshots: SpellActionSnapshot[] = [];

            const spellActList = spellActions.map((spellAction, i) => {

                // const spellActionSnapshot = onSpellAction(spellAction, startTime);

                // spellSnapshots.push(spellActionSnapshot);

                // if (!i && !hadCurrentSpellAction) {
                //     spellActionTimer.onAdd(spellActionSnapshot);
                // }

                if (i) {
                    startTime += spellAction.spell.feature.duration;
                }

                return {
                    spellAction,
                    startTime
                };
            });

            api.dispatch(SpellActionLaunchAction({
                spellActList
            }));

            if (!hadCurrentSpellAction) {
                spellActionTimer.onAdd(spellActList[ 0 ].startTime);
            }

        } else if (BattleStateTurnEndAction.match(action)) {

            const currentBattleHash = extractCurrentHash(api.getState);

            cancelCurrentAndNextSpells(currentBattleHash);

        } else if (ReceiveMessageAction.match(action)) {
            const { payload } = action;

            if (payload.type === 'confirm') {
                const { isOk, lastCorrectHash } = payload;
                if (!isOk) {

                    cancelCurrentAndNextSpells(lastCorrectHash);
                }

            } else if (payload.type === 'notify') {

                const { spellActionSnapshot: {
                    spellId, position, actionArea, startTime
                } } = payload;

                const futureSpells = extractFutureSpells(api.getState);

                const spell = futureSpells.find(s => s.id === spellId);

                assertIsDefined(spell);

                const spellAction: SpellAction = {
                    spell,
                    position,
                    actionArea
                };

                // const spellAct = onSpellAction(spellAction, startTime);

                const spellActionState = extractState(api.getState);

                const hadCurrentSpell = !!spellActionState.currentSpellAction;

                api.dispatch(SpellActionLaunchAction({
                    spellActList: [ { spellAction, startTime } ]
                }));

                if (!hadCurrentSpell) {
                    spellActionTimer.onAdd(startTime);
                }
            }
        }

        next(action);
    };
};
