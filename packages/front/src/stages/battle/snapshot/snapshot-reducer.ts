import { createReducer } from '@reduxjs/toolkit';
import { assertIsDefined, BattleSnapshot, characterEntityToSnapshot, denormalize, DynamicBattleSnapshot, getBattleSnapshotWithHash, normalize, Normalized, SpellActionSnapshot, spellEntityToSnapshot } from '@timeflies/shared';
import { BattleStartAction } from '../battle-actions';
import { BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { getSpellLaunchFn as spellLaunchFnGetter } from '../engine/spellMapping';
import { Character, updateCharacterFromSnapshot } from '../entities/character/Character';
import { Player } from '../entities/player/Player';
import { Spell, updateSpellFromSnapshot } from '../entities/spell/Spell';
import { Team } from '../entities/team/Team';
import { SpellActionCancelAction, SpellActionLaunchAction, SpellActionTimerEndAction, SpellActionTimerStartAction } from '../spellAction/spell-action-actions';
import { BattleData, BattleDataPeriod, periodList } from './battle-data';

export type SnapshotState = {
    // TODO consider normalize it
    snapshotList: BattleSnapshot[];
    myPlayerId: string;
    launchTime: number;
    teamList: Normalized<Team>;
    playerList: Normalized<Player>;
    battleDataCurrent: BattleData<'current'>;
    battleDataFuture: BattleData<'future'>;

    // TODO consider normalize it
    spellActionSnapshotList: SpellActionSnapshot[];
    currentSpellAction: SpellActionSnapshot | null;
};

export const getBattleData = <P extends BattleDataPeriod>(state: SnapshotState, period: P): BattleData<P> => period === 'current'
    ? state.battleDataCurrent as BattleData<P>
    : state.battleDataFuture as BattleData<P>;

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
    spells: {},
    characters: {},
});

export const getInitialSnapshotState = (partial: Partial<SnapshotState> = {}): SnapshotState => ({
    snapshotList: [],
    myPlayerId: '',
    launchTime: -1,
    teamList: {},
    playerList: {},
    battleDataCurrent: getInitialBattleData(),
    battleDataFuture: getInitialBattleData(),
    spellActionSnapshotList: [],
    currentSpellAction: null,
    ...partial
});

const getLastSnapshot = (snapshotList: BattleSnapshot[]): BattleSnapshot | undefined => snapshotList[ snapshotList.length - 1 ];

const commit = (state: SnapshotState, time: number): void => {

    const { launchTime, snapshotList } = state;
    const { characters, spells } = state.battleDataFuture;

    const isFirstSnapshot = !snapshotList.length;

    const partialSnap: Omit<BattleSnapshot, 'battleHash'> = {
        time,
        launchTime,
        charactersSnapshots: denormalize(characters).map(characterEntityToSnapshot),
        spellsSnapshots: denormalize(spells).map(spellEntityToSnapshot)
    };

    const snap: BattleSnapshot = getBattleSnapshotWithHash(partialSnap);

    snapshotList.push(snap);

    state.battleDataFuture.battleHash = snap.battleHash;

    if (isFirstSnapshot) {
        state.battleDataCurrent.battleHash = snap.battleHash;
    }
};

const updateBattleDataFromSnapshot = (data: BattleData<any>, myPlayerId: string, period: BattleDataPeriod, {
    battleHash, charactersSnapshots, spellsSnapshots
}: DynamicBattleSnapshot) => {

    data.battleHash = battleHash;

    spellsSnapshots.forEach(snap => {
        const spell = data.spells[ snap.id ];
        if (spell) {
            updateSpellFromSnapshot(spell, snap);
        } else {
            data.spells[ snap.id ] = Spell(period, snap);
        }
    });

    charactersSnapshots.forEach(snap => {
        const character = data.characters[ snap.id ];
        if (character) {
            updateCharacterFromSnapshot(character, snap);
        } else {
            data.characters[ snap.id ] = Character(period, myPlayerId, snap);
        }
    });
};

type Dependencies = {
    getSpellLaunchFn: typeof spellLaunchFnGetter;
};

export const snapshotReducer = ({ getSpellLaunchFn }: Dependencies = { getSpellLaunchFn: spellLaunchFnGetter }) => createReducer(
    getInitialSnapshotState(),
    {
        [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
            const { myPlayerId, teamSnapshotList, playerSnapshotList, entitiesSnapshot } = payload;
            const { battleHash, spellsSnapshots, charactersSnapshots } = entitiesSnapshot;

            state.myPlayerId = myPlayerId;
            state.teamList = normalize(teamSnapshotList.map(Team));
            state.playerList = normalize(playerSnapshotList.map(Player));
            periodList.forEach(period => {

                const data = getBattleData(state, period);

                data.battleHash = battleHash;
                data.spells = normalize(spellsSnapshots.map(snap => Spell(period, snap)));
                data.characters = normalize(charactersSnapshots.map(snap => Character(period, myPlayerId, snap)));
            });
        },
        [ BattleStateTurnStartAction.type ]: (state, action: BattleStateTurnStartAction) => {
            state.spellActionSnapshotList = [];
            commit(state, Date.now());
        },
        [ BattleStateTurnEndAction.type ]: (state, action: BattleStateTurnEndAction) => {

            const now = Date.now();

            while (getLastSnapshot(state.snapshotList)!.time >= now) {
                state.snapshotList.pop();
            }

            const currentSnapshot = getLastSnapshot(state.snapshotList);
            assertIsDefined(currentSnapshot);

            updateBattleDataFromSnapshot(state.battleDataFuture, state.myPlayerId, 'future', currentSnapshot);
            updateBattleDataFromSnapshot(state.battleDataCurrent, state.myPlayerId, 'current', currentSnapshot);
        },
        [ SpellActionTimerEndAction.type ]: (state, { payload: { removed, correctHash } }: SpellActionTimerEndAction) => {
            state.currentSpellAction = null;

            if (removed) {
                assertHashIsInSnapshotList(correctHash, state.snapshotList);

                while (getLastSnapshot(state.snapshotList)!.battleHash !== correctHash) {
                    state.snapshotList.pop();
                }

            } else {

                const snapshot = state.snapshotList.find(s => s.battleHash === correctHash);

                if (snapshot) {
                    updateBattleDataFromSnapshot(state.battleDataCurrent, state.myPlayerId, 'current', snapshot);
                }
            }
        },
        [ SpellActionLaunchAction.type ]: (state, { payload }: SpellActionLaunchAction) => {
            const { spellActList } = payload;

            spellActList.forEach(({ spellAction, startTime }) => {

                const { spell } = spellAction;

                const duration = spellAction.spell.features.duration;

                const commitTime = startTime + duration;

                const spellLaunchFn = getSpellLaunchFn(spell.staticData.type);

                const partialSnapshot: Omit<SpellActionSnapshot, 'battleHash'> = {
                    startTime,
                    characterId: spellAction.spell.characterId,
                    duration,
                    spellId: spellAction.spell.id,
                    position: spellAction.position,
                    actionArea: spellAction.actionArea
                };

                spellLaunchFn(spell, partialSnapshot, state.battleDataFuture);

                commit(state, commitTime);

                const snapshot: SpellActionSnapshot = {
                    ...partialSnapshot,
                    battleHash: state.battleDataFuture.battleHash,
                };

                state.spellActionSnapshotList.push(snapshot);

                if (!state.currentSpellAction) {
                    state.currentSpellAction = snapshot;
                }
            });

        },
        [ SpellActionTimerStartAction.type ]: (state, { payload }: SpellActionTimerStartAction) => {
            state.currentSpellAction = payload.spellActionSnapshot;
        },
        [ SpellActionCancelAction.type ]: (state, { payload: { spellActionSnapshotsValids, correctBattleSnapshot } }: SpellActionCancelAction) => {
            state.spellActionSnapshotList = spellActionSnapshotsValids;
            state.currentSpellAction = null;

            updateBattleDataFromSnapshot(state.battleDataFuture, state.myPlayerId, 'future', correctBattleSnapshot);
            updateBattleDataFromSnapshot(state.battleDataCurrent, state.myPlayerId, 'current', correctBattleSnapshot);
        }
    }
);


