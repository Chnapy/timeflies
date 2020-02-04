import { SpellFeatures, SpellSnapshot, StaticSpell } from '@shared/Spell';
import { BattleScene } from '../scenes/BattleScene';
import { Character } from './Character';
import { WithSnapshot } from './WithSnapshot';

export class Spell implements WithSnapshot<SpellSnapshot> {

    static readonly getSheetKey = (): string => `spells_sheet`;

    readonly staticData: Readonly<StaticSpell>;
    readonly feature: SpellFeatures;
    get id(): string {
        return this.staticData.id;
    }

    readonly character: Character;

    constructor({ staticData, features }: SpellSnapshot, character: Character, scene: BattleScene) {
        this.staticData = staticData;
        this.feature = { ...features };

        this.character = character;
    }

    getSnapshot(): SpellSnapshot {
        return {
            staticData: this.staticData,
            features: { ...this.feature }
        };
    }

    updateFromSnapshot(snapshot: SpellSnapshot) {
    }
}