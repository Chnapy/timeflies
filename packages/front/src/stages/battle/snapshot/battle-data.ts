import { BattleStateEntity } from '@timeflies/shared';
import { Character } from '../entities/character/Character';
import { Spell } from '../entities/spell/Spell';

export const periodList = [ 'current', 'future' ] as const;
export type BattleDataPeriod = (typeof periodList)[ number ];

export type BattleData<P extends BattleDataPeriod> =
    & BattleStateEntity<
        Character<P>,
        Spell<P>
    >
    & {
        battleHash: string;
    };
