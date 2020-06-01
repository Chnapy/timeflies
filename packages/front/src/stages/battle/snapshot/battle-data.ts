import { Team } from '../entities/team/Team'; import { Player } from '../entities/player/Player'; import { Character } from '../entities/character/Character'; import { Spell } from '../entities/spell/Spell';

export const periodList = [ 'current', 'future' ] as const;
export type BattleDataPeriod = (typeof periodList)[number];

export type BattleData<P extends BattleDataPeriod> = {
    battleHash: string;
    teams: Team<P>[];
    players: Player<P>[];
    characters: Character<P>[];
    spells: Spell<P>[];
};
