import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { BPlayer } from "./BPlayer";
import { BSpell } from "./BSpell";

export class BCharacter {

    get id(): string {
        return this.staticData.id;
    }

    readonly staticData: Readonly<StaticCharacter>;
    readonly player: BPlayer;

    position: Position;
    orientation: Orientation;

    readonly features: CharacterFeatures;
    readonly spells: readonly BSpell[];

    get isAlive(): boolean {
        return this.features.life > 0;
    }

    constructor(staticData: StaticCharacter, player: BPlayer) {
        this.staticData = staticData;
        this.player = player;
        this.features = {
            ...staticData.initialFeatures
        };
        this.orientation = 'bottom'; // should be calculated (?)
        this.position = { x: -1, y: -1 }; // same
        this.spells = staticData.staticSpells.map(ss => new BSpell(ss, this));
    }
    
    toSnapshot(): CharacterSnapshot {
        return {
            id: this.staticData.id,
            staticData: this.staticData,
            features: this.features,
            orientation: this.orientation,
            position: this.position,
            spellsSnapshots: this.spells.map(s => s.toSnapshot())
        };
    }
}
