import { BattleDataPeriod } from '../../../BattleData';

export interface PeriodicEntity<P extends BattleDataPeriod, S extends { id: string; }> {
    readonly period: P;
    readonly id: string;
    getSnapshot(): S;
    updateFromSnapshot(snapshot: S): void;
}

export interface SeedPeriodicProps<P extends BattleDataPeriod> {
    period: P;
}
