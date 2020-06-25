import { CharacterSnapshot, SpellSnapshot } from '../entities';
import crypto from 'crypto-js/sha1';

export type DynamicBattleSnapshot = {
    battleHash: string;
    charactersSnapshots: CharacterSnapshot[];
    spellsSnapshots: SpellSnapshot[];
};

export type BattleSnapshot = DynamicBattleSnapshot & {
    time: number;
    launchTime: number;
};

export const getBattleSnapshotWithHash = ({
    charactersSnapshots,
    spellsSnapshots,
    ...rest
}: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {

    const battleHash = digest(
        {
            charactersSnapshots,
            spellsSnapshots,
        }
    );

    return {
        charactersSnapshots,
        spellsSnapshots,
        ...rest,
        battleHash
    };
}

function digest(obj) {
    return crypto(stringify(obj)).toString();
};

const DELIM = '|';

function stringify(obj): string {
    if (Array.isArray(obj)) {
        let stringifiedArr: string[] = []
        for (let i = 0; i < obj.length; i++) {
            stringifiedArr[ i ] = stringify(obj[ i ])
        }

        return JSON.stringify(stringifiedArr)
    } else if (typeof obj === 'object' && obj !== null) {
        let acc: string[] = []
        let sortedKeys = Object.keys(obj).sort()

        for (let i = 0; i < sortedKeys.length; i++) {
            let k = sortedKeys[ i ]
            acc[ i ] = `${k}:${stringify(obj[ k ])}`
        }

        return acc.join(DELIM)
    }

    return obj;
}
