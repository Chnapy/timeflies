import { SpellActionSnapshot } from '@timeflies/shared';
import { GlobalTurn } from './stages/battle/cycle/GlobalTurn';
import { Character } from './stages/battle/entities/character/Character';
import { Player } from './stages/battle/entities/player/Player';
import { Team } from './stages/battle/entities/team/Team';

export interface BattleDataCycle {
    readonly launchTime: number;
    globalTurn?: GlobalTurn;
}

interface BattleData {
    battleHash: string;
    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];
}

export interface BattleDataCurrent extends BattleData {
}

export interface BattleDataFuture extends BattleData {
    readonly spellActionSnapshotList: SpellActionSnapshot[];
}

export interface BattleDataMap {
    cycle: BattleDataCycle;
    current: BattleDataCurrent;
    future: BattleDataFuture;
}

export type BattleDataKey = keyof BattleDataMap;
export type BattleDataPeriod = Extract<BattleDataKey, 'current' | 'future'>;
