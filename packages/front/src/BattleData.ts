import { SpellActionSnapshot } from '@timeflies/shared';
import { GlobalTurn } from './stages/battle/cycle/GlobalTurn';
import { Character } from './stages/battle/entities/Character';
import { Player } from './stages/battle/entities/Player';
import { Team } from './stages/battle/entities/Team';

export interface BattleDataCycle {
    readonly launchTime: number;
    globalTurn?: GlobalTurn;
}

export interface BattleData {
    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];
}

export interface BattleDataFuture extends BattleData {
    readonly spellActionSnapshotList: SpellActionSnapshot[];
}

export interface BattleDataMap {
    cycle: BattleDataCycle;
    current: BattleData;
    future: BattleDataFuture;
}
