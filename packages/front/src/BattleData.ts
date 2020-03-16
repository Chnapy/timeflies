import { Character } from './stages/battle/entities/Character';
import { Player } from './stages/battle/entities/Player';
import { Team } from './stages/battle/entities/Team';
import { GlobalTurn } from './stages/battle/cycle/GlobalTurn';

export interface BattleDataCycle {
    readonly launchTime: number;
    globalTurn?: GlobalTurn;
}

export interface BattleData {
    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];
}

export interface BattleDataMap {
    cycle: BattleDataCycle;
    current: BattleData;
    future: BattleData;
}
