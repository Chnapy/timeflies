import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { BCharacter } from "./BCharacter";

export class BSpell {

    get id(): string {
        return this.staticData.id;
    }

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
            id: this.staticData.id,
            staticData: this.staticData,
            features: this.features
        };
    }
}
