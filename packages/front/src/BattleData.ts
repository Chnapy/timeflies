import { SpellActionSnapshot } from '@timeflies/shared';
import { Character } from './stages/battle/entities/character/Character';
import { Player } from './stages/battle/entities/player/Player';
import { Team } from './stages/battle/entities/team/Team';

// export interface BattleDataCycle {
//     readonly launchTime: number;
//     globalTurn?: GlobalTurn;
// }

// interface BattleData<P extends BattleDataPeriod> {
//     battleHash: string;
//     readonly teams: Team<P>[];
//     readonly players: Player<P>[];
//     readonly characters: Character<P>[];
// }

// export interface BattleDataCurrent extends BattleData<'current'> {
// }

// export interface BattleDataFuture extends BattleData<'future'> {
//     readonly spellActionSnapshotList: SpellActionSnapshot[];
// }

// export interface BattleDataMap {
//     cycle: BattleDataCycle;
//     current: BattleDataCurrent;
//     future: BattleDataFuture;
// }

// export type BattleDataKey = keyof BattleDataMap;
// export type BattleDataPeriod = Extract<BattleDataKey, 'current' | 'future'>;
