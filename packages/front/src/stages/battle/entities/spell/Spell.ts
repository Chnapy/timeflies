import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { Character } from '../character/Character';
import { PeriodicEntity } from '../PeriodicEntity';
import { BattleDataPeriod } from '../../../../BattleData';

export interface Spell<P extends BattleDataPeriod> extends PeriodicEntity<P, SpellSnapshot> {
    readonly id: string;
    readonly index: number;
    readonly staticData: Readonly<StaticSpell>;
    readonly feature: Readonly<SpellFeatures>;
    readonly character: Character<P>;
}

export const Spell = <P extends BattleDataPeriod>(period: P, { index, staticData, features: _features }: SpellSnapshot, character: Character<P>): Spell<P> => {

    let features: Readonly<SpellFeatures> = { ..._features };

    return {
        period,
        get id(): string {
            return staticData.id;
        },
        index,
        staticData,
        get feature(): Readonly<SpellFeatures> {
            return features;
        },
        character,

        getSnapshot(): SpellSnapshot {
            return {
                id: staticData.id,
                index,
                staticData,
                features: { ...features }
            };
        },

        updateFromSnapshot(snapshot: SpellSnapshot) {
        }
    }
};
