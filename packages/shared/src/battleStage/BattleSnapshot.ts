import objectHash from 'object-hash';
import { CharacterSnapshot, SpellSnapshot } from '../entities';

export interface BattleSnapshot {
    time: number;
    battleHash: string;
    launchTime: number;
    charactersSnapshots: CharacterSnapshot[];
    spellsSnapshots: SpellSnapshot[];
}

export const getBattleSnapshotWithHash = ({
    charactersSnapshots,
    spellsSnapshots,
    ...rest
}: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {

    const battleHash = objectHash(
        // TODO workaround for https://github.com/puleos/object-hash/issues/62
        JSON.parse(JSON.stringify(
            {
                charactersSnapshots,
                spellsSnapshots,
            }
        )), {
        respectType: false
    });

    return {
        charactersSnapshots,
        spellsSnapshots,
        ...rest,
        battleHash
    };
}
