import { createReducer } from '@reduxjs/toolkit';
import { assertIsDefined, BattleSnapshot, getBattleSnapshotWithHash } from '@timeflies/shared';
import { BattleDataPeriod } from '../../../BattleData';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { Character } from '../entities/character/Character';
import { PeriodicEntity } from '../entities/PeriodicEntity';
import { Player } from '../entities/player/Player';
import { Team } from '../entities/team/Team';
import { BattleCommitAction } from './snapshot-manager-actions';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';

type BattleData<P extends BattleDataPeriod> = {
    battleHash: string;
    teams: Team<P>[];
    players: Player<P>[];
    characters: Character<P>[];
};

export type SnapshotState = {
    snapshotList: BattleSnapshot[];
    launchTime: number;
    battleDataCurrent: BattleData<'current'>;
    battleDataFuture: BattleData<'future'>;
};

export const assertEntitySnapshotConsistency = <S extends { id: string; }>(
    entityList: PeriodicEntity<any, S>[],
    snapshotList: S[]
): void | never => {
    const serialize = (list: { id: string; }[]) => list.map(i => i.id).sort().join('.');

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

const getInitialBattleData = (): BattleData<any> => ({
    battleHash: '',
    characters: [],
    players: [],
    teams: []
});

const initialState: SnapshotState = {
    snapshotList: [],
    launchTime: -1,
    battleDataCurrent: getInitialBattleData(),
    battleDataFuture: getInitialBattleData(),
};

const getLastSnapshot = (snapshotList: BattleSnapshot[]): BattleSnapshot | undefined => snapshotList[ snapshotList.length - 1 ];

const commit = (state: SnapshotState, time: number): void => {

    const { launchTime, snapshotList } = state;
    const { teams } = state.battleDataFuture;

    const isFirstSnapshot = !snapshotList.length;

    const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
        time,
        launchTime,
        teamsSnapshots: teams.map(t => t.getSnapshot())
    };

    const snap: BattleSnapshot = getBattleSnapshotWithHash(partialSnap);

    snapshotList.push(snap);

    state.battleDataFuture.battleHash = snap.battleHash;

    if (isFirstSnapshot) {
        state.battleDataCurrent.battleHash = snap.battleHash;
    }
};

const updateBattleDataFromSnapshot = (battleData: BattleData<any>, { battleHash, teamsSnapshots }: BattleSnapshot) => {

    battleData.battleHash = battleHash;

    const teams: Team<BattleDataPeriod>[] = battleData.teams;

    assertEntitySnapshotConsistency(teams, teamsSnapshots);

    teamsSnapshots.forEach(snap =>
        teams.find(t => t.id === snap.id)!.updateFromSnapshot(snap)
    );
};

export const snapshotReducer = createReducer(initialState, {
    [ BattleCommitAction.type ]: (state, { payload: { time } }: BattleCommitAction) => {
        commit(state, time);
    },
    [ BattleStateTurnStartAction.type ]: (state, action: BattleStateTurnStartAction) => {
        commit(state, Date.now());
    },
    [ BattleStateTurnEndAction.type ]: (state, action: BattleStateTurnEndAction) => {

        const now = Date.now();

        while (getLastSnapshot(state.snapshotList)!.time >= now) {
            state.snapshotList.pop();
        }

        const currentSnapshot = getLastSnapshot(state.snapshotList);
        assertIsDefined(currentSnapshot);

        updateBattleDataFromSnapshot(state.battleDataFuture, currentSnapshot);
        updateBattleDataFromSnapshot(state.battleDataCurrent, currentSnapshot);
    },
    [ SpellActionTimerEndAction.type ]: (state, { payload: { removed, correctHash } }: SpellActionTimerEndAction) => {

        if (removed) {
            assertHashIsInSnapshotList(correctHash, state.snapshotList);

            while (getLastSnapshot(state.snapshotList)!.battleHash !== correctHash) {
                state.snapshotList.pop();
            }

            const currentSnapshot = getLastSnapshot(state.snapshotList)!;
            updateBattleDataFromSnapshot(state.battleDataFuture, currentSnapshot);

            if (currentSnapshot.time < Date.now()) {
                updateBattleDataFromSnapshot(state.battleDataCurrent, currentSnapshot);
            }
        } else {

            const snapshot = state.snapshotList.find(s => s.battleHash === correctHash);

            assertIsDefined(snapshot);

            updateBattleDataFromSnapshot(state.battleDataCurrent, snapshot);
        }
    }
});


