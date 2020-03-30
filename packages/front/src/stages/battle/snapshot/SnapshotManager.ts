import { assertIsDefined, assertThenGet, BattleSnapshot, getBattleSnapshotWithHash, getId } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { BattleDataPeriod } from '../../../BattleData';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';
import { NotifyDeathsAction } from '../cycle/CycleManager';
import { WithSnapshot } from '../entities/WithSnapshot';
import { SpellActionTimerEndAction } from '../spellAction/SpellActionTimer';

export interface BattleCommitAction extends IGameAction<'battle/commit'> {
    time: number;
}

export interface SnapshotManager {
}

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

const assertHashIsInSnapshotList = (
    hash: string,
    snapshotList: { battleHash: string }[]
): void | never => {
    if (!snapshotList.some(snap => snap.battleHash === hash)) {
        throw new Error(`Hash <${hash}> not found in snapshot list.
        There is an inconsistence front<->back.`);
    }
};

export const SnapshotManager = (): SnapshotManager => {

    const snapshotList: BattleSnapshot[] = [];

    const getLastSnapshot = (): BattleSnapshot | undefined => snapshotList[ snapshotList.length - 1 ];

    const { dispatchNotifyDeaths } = serviceDispatch({
        dispatchNotifyDeaths: (): NotifyDeathsAction => ({
            type: 'battle/notify-deaths'
        })
    });

    const updateBattleDataFromSnapshot = (period: BattleDataPeriod, { battleHash, teamsSnapshots }: BattleSnapshot) => {
        const battleData = serviceBattleData(period);

        battleData.battleHash = battleHash;

        assertEntitySnapshotConsistency(battleData.teams, teamsSnapshots);

        teamsSnapshots.forEach(snap =>
            battleData.teams.find(t => t.id === snap.id)!.updateFromSnapshot(snap)
        );
    };

    const updateCurrentBattleDataFromHash = (hash: string) => {
        const snapshot = snapshotList.find(s => s.battleHash === hash);

        assertIsDefined(snapshot);

        const { characters } = serviceBattleData('current');

        const serializeDeaths = () => characters.filter(c => !c.isAlive).map(getId).join('.');

        const serializedDeathsBefore = serializeDeaths();

        updateBattleDataFromSnapshot('current', snapshot);

        const serializedDeathsAfter = serializeDeaths();
        
        if (serializedDeathsBefore !== serializedDeathsAfter) {
            dispatchNotifyDeaths();
        }
    };

    const commit = (time: number) => {
        const { launchTime } = serviceBattleData('cycle');
        const { teams } = serviceBattleData('future');

        const isFirstSnapshot = !snapshotList.length;

        const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
            time,
            launchTime,
            teamsSnapshots: teams.map(t => t.getSnapshot())
        };

        const snap: BattleSnapshot = getBattleSnapshotWithHash(partialSnap);

        snapshotList.push(snap);

        const futureBattleData = serviceBattleData('future');
        futureBattleData.battleHash = snap.battleHash;

        if (isFirstSnapshot) {
            const currentBattleData = serviceBattleData('current');
            currentBattleData.battleHash = snap.battleHash;
        }
    };

    const rollback = (correctHash: string) => {

        assertHashIsInSnapshotList(correctHash, snapshotList);

        while (getLastSnapshot()!.battleHash !== correctHash) {
            snapshotList.pop();
        }

        const currentSnapshot = getLastSnapshot()!;
        updateBattleDataFromSnapshot('future', currentSnapshot);

        if (currentSnapshot.time < Date.now()) {
            updateBattleDataFromSnapshot('current', currentSnapshot);
        }
    };

    const rollbackFuture = () => {

        const now = Date.now();

        while (assertThenGet(
            getLastSnapshot(),
            assertIsDefined
        ).time >= now) {
            snapshotList.pop();
        }

        const currentSnapshot = assertThenGet(
            getLastSnapshot(),
            assertIsDefined
        );
        updateBattleDataFromSnapshot('future', currentSnapshot);
        updateBattleDataFromSnapshot('current', currentSnapshot);
    };

    const { onAction } = serviceEvent();

    onAction<BattleCommitAction>('battle/commit', ({ time }) => commit(time));
    onAction<BStateAction>('battle/state/event', ({ eventType }) => {
        if (eventType === 'TURN-END') {
            rollbackFuture();
        } else if (eventType === 'TURN-START') {
            commit(Date.now());
        }
    });
    onAction<SpellActionTimerEndAction>('battle/spell-action/end', ({ removed, correctHash }) => {

        if (removed) {
            rollback(correctHash);
        } else {
            updateCurrentBattleDataFromHash(correctHash);
        }
    });

    return {};
};
