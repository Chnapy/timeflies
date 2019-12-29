import { Character } from './Character';
import { WithSnapshot } from './WithSnapshot';
import { BattleScene } from '../scenes/BattleScene';
import { AssetManager } from '../../assetManager/AssetManager';

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

    // graphicContainer!: Phaser.GameObjects.Container;

    readonly graphicSprite: Phaser.GameObjects.Sprite;

    constructor({ id, name, type, zone, time, attaque }: SpellSnapshot, character: Character, scene: BattleScene) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.zone = zone;
        this.time = time;
        this.attaque = attaque;

        this.character = character;

        // this.graphicContainer = this.scene.add.container(worldPosition.x + 0.5, worldPosition.y + 0.5);

        // const { tileWidth, tileHeight } = this.scene.map.tilemap;
        // const graphicSquare = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, tileWidth, tileHeight);
        // graphicSquare.setStrokeStyle(1, this.team.color);

        this.graphicSprite = scene.add.sprite(0, 0, Spell.getSheetKey());
        this.graphicSprite.setFrame(AssetManager.spells.spellsMap[type]);

        // const graphicText = new Phaser.GameObjects.Text(this.scene, 0, 0, name, {
        //     color: 'black'
        // });
        // graphicText.setOrigin(0.5, 1);

        // this.graphicContainer.add([
        //     graphicSquare,
        //     this.graphicSprite,
        //     graphicText
        // ]);
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