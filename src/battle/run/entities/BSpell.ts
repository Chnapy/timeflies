import { BCharacter } from "./BCharacter";
import { StaticSpell, SpellFeatures, SpellSnapshot } from '../../../shared/Spell';

export class BSpell {

    readonly staticData: Readonly<StaticSpell>;
    readonly character: BCharacter;
    readonly features: SpellFeatures;

    constructor(staticData: StaticSpell, character: BCharacter) {
        this.staticData = staticData;
        this.character = character;
        this.features = {
            ...staticData.initialFeatures
        };
    }
    
    toSnapshot(): SpellSnapshot {
        return {
            staticData: this.staticData,
            features: this.features
        };
    }
}
