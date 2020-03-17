import { assertIsDefined, assertThenGet, BattleSnapshot, generateObjectHash } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';

export interface BattleCommitAction extends IGameAction<'battle/commit'> {
}

export interface SnapshotManager {
    getLastHash(): string;
}

export const SnapshotManager = (): SnapshotManager => {

    // TODO add time
    const snapshots: BattleSnapshot[] = [];

    const commit = () => {
        const { launchTime } = serviceBattleData('cycle');
        const { teams } = serviceBattleData('future');

        const partialSnap: Omit<BattleSnapshot, 'hash'> = {
            launchTime,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const hash = generateObjectHash(partialSnap);

        const snap: BattleSnapshot = { hash, ...partialSnap };

        snapshots.push(snap);
    };

    const { onAction } = serviceEvent();

    onAction<BattleCommitAction>('battle/commit', commit);
    onAction<BStateAction>('battle/state/event', ({ eventType }) => {
        if (eventType === 'TURN-END') {
            commit();
        }
    });

    return {
        getLastHash() {
            return assertThenGet(
                snapshots[ snapshots.length - 1 ],
                assertIsDefined
            ).hash;
        }
    };
};
