import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Spell<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    index: number;
    staticData: Readonly<StaticSpell>;
    feature: SpellFeatures;
    characterId: string;
};

export const spellToSnapshot = ({ id, characterId, staticData, index, feature: features }: Spell<BattleDataPeriod>): SpellSnapshot => {
    return {
        id,
        characterId,
        staticData,
        index,
        features
    };
};

export const Spell = <P extends BattleDataPeriod>(period: P, { index, staticData, features, characterId }: SpellSnapshot): Spell<P> => {

    return {
        id: staticData.id,
        period,
        index,
        staticData,
        feature: features,
        characterId
    };

    // return {
    //     period,
    //     get id(): string {
    //         return staticData.id;
    //     },
    //     index,
    //     staticData,
    //     get feature(): Readonly<SpellFeatures> {
    //         return features;
    //     },
    //     character,

    //     getSnapshot(): SpellSnapshot {
    //         return {
    //             id: staticData.id,
    //             index,
    //             staticData,
    //             features: { ...features }
    //         };
    //     },

    //     updateFromSnapshot(snapshot: SpellSnapshot) {
    //     }
    // }
};
