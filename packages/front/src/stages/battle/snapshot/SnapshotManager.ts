import { assertIsDefined, assertThenGet, BattleSnapshot, generateObjectHash, ConfirmSAction, getId } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';
import { WithSnapshot } from '../entities/WithSnapshot';

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

export const assertEntitySnapshotConsistency = <S extends { id: string; }>(
    entityList: WithSnapshot<S>[],
    snapshotList: S[]
): void | never => {
    const serialize = (list: { id: string; }[]) => list.map(getId).sort().join('.');
    
    if (serialize(entityList) !== serialize(snapshotList)) {
        throw new Error(`Ids of entities differs from these snapshots [${serialize(entityList)}]<->[${serialize(snapshotList)}].
        There is an inconsistence front<->back.`);
    }
}

export const SnapshotManager = (): SnapshotManager => {

    // TODO add time
    const snapshotList: BattleSnapshot[] = [];

    const updateBattleDataFromSnapshot = ({ teamsSnapshots }: BattleSnapshot) => {
        const { teams } = serviceBattleData('future');

        assertEntitySnapshotConsistency(teams, teamsSnapshots);

        teamsSnapshots.forEach(snap => teams.find(t => t.id === snap.id)!.updateFromSnapshot(snap));
    };

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

        const currentSnapshot = snapshotList[ snapshotList.length - 1 ];
        updateBattleDataFromSnapshot(currentSnapshot);
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
