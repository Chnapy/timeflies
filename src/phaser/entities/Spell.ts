import { BattleScene } from '../scenes/BattleScene';
import { Character } from './Character';
import { WithSnapshot } from './WithSnapshot';

export type SpellType =
    | 'move'
    | 'orientate'
    | 'sampleSpell1'
    | 'sampleSpell2'
    | 'sampleSpell3';

export interface SpellSnapshot {
    id: number;
    name: string;
    type: SpellType;
    zone: number;
    time: number;
    attaque: number;
}

export class Spell implements WithSnapshot<SpellSnapshot> {

    static readonly getSheetKey = (): string => `spells_sheet`;

    readonly id: number;
    readonly name: string;
    readonly type: SpellType;
    readonly zone: number;
    readonly time: number;
    readonly attaque: number;

    readonly character: Character;

    constructor({ id, name, type, zone, time, attaque }: SpellSnapshot, character: Character, scene: BattleScene) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.zone = zone;
        this.time = time;
        this.attaque = attaque;

        this.character = character;
    }

    getSnapshot(): SpellSnapshot {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            time: this.time,
            zone: this.zone,
            attaque: this.attaque
        };
    }

    updateFromSnapshot(snapshot: SpellSnapshot) {
    }
}