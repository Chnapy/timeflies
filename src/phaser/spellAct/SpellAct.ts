import { Spell, SpellType } from '../entities/Spell';
import { Position, Character } from '../entities/Character';
import { MapManager } from '../map/MapManager';
import { BattleData, BattleScene } from '../scenes/BattleScene';

export type SpellResultEnum = 'grid' | 'battleState' | 'charState';

export type SpellResult = Partial<Record<SpellResultEnum, boolean>>;

export abstract class SpellAct<T extends SpellType> {

    protected readonly scene: BattleScene;
    protected readonly spell: Spell;
    protected readonly character: Character;
    protected readonly map: MapManager;
    protected readonly characters: Character[];

    constructor(spell: Spell, scene: BattleScene) {
        this.scene = scene;
        this.spell = spell;
        this.character = spell.character;
        this.map = scene.map;
        this.characters = scene.battleData.characters;
    }

    abstract async launch(targetPositions: Position[]): Promise<SpellResult>;

    abstract cancel(): void;
}