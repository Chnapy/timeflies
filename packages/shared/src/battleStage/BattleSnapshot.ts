import { TeamSnapshot } from "../entities/Team";
import objectHash from 'object-hash';
import { PlayerSnapshot, CharacterSnapshot, SpellSnapshot } from '../entities';

export interface BattleSnapshot {
    time: number;
    battleHash: string;
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
    playersSnapshots: PlayerSnapshot[];
    charactersSnapshots: CharacterSnapshot[];
    spellsSnapshots: SpellSnapshot[];
}

export const getBattleSnapshotWithHash = ({
    teamsSnapshots,
    ...rest
}: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {

    const battleHash = objectHash(
        // TODO workaround for https://github.com/puleos/object-hash/issues/62
        JSON.parse(JSON.stringify(
            teamsSnapshots
        )), {
        respectType: false
    });

    return {
        teamsSnapshots,
        ...rest,
        battleHash
    };
}
