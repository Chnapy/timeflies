import { assertIsDefined, assertThenGet, BattleSnapshot, generateObjectHash, ConfirmSAction } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';

export interface BattleCommitAction extends IGameAction<'battle/commit'> {
}

export interface SnapshotManager {
    getLastHash(): string;
}

export const assertHashIsInSnapshotList = (
    hash: string,
    snapshotList: { battleHash: string }[]
): void | never => {
    if (!snapshotList.some(snap => snap.battleHash === hash)) {
        throw new Error(`Hash <${hash}> not found in snapshot list.
        There is an inconsistence front<->back.`);
    }
};

export const SnapshotManager = (): SnapshotManager => {

    // TODO add time
    const snapshotList: BattleSnapshot[] = [];

    const commit = () => {
        const { launchTime } = serviceBattleData('cycle');
        const { teams } = serviceBattleData('future');

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            launchTime,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const battleHash = generateObjectHash(partialSnap);

        const snap: BattleSnapshot = { battleHash, ...partialSnap };

        snapshotList.push(snap);
    };

    const rollback = (correctHash: string) => {

        assertHashIsInSnapshotList(correctHash, snapshotList);

        while (snapshotList[ snapshotList.length - 1 ].battleHash !== correctHash) {
            snapshotList.pop();
        }

    };

    const { onAction, onMessageAction } = serviceEvent();

    onAction<BattleCommitAction>('battle/commit', commit);
    onAction<BStateAction>('battle/state/event', ({ eventType }) => {
        if (eventType === 'TURN-END') {
            commit();
        }
    });

    onMessageAction<ConfirmSAction>('confirm', ({ isOk, lastCorrectHash }) => {
        if (!isOk) {
            rollback(lastCorrectHash);
        }
    });

    return {
        getLastHash() {
            return assertThenGet(
                snapshotList[ snapshotList.length - 1 ],
                assertIsDefined
            ).battleHash;
        }
    };
};
