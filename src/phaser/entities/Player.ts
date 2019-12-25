import { Character, CharacterInfos, Position } from './Character';
import { MapComponent } from '../map/Map';

export interface PlayerInfos {
    itsMe: boolean;
    name: string;
    charactersInfos: CharacterInfos[];
}

export interface SpriteGenerator {
    spriteGenerate(x: number, y: number, texture: string, frame?: string | integer): Phaser.GameObjects.Sprite;
    tileToWorldPosition: MapComponent['tileToWorldPosition'];
}

export class Player {

    readonly itsMe: boolean;
    readonly name: string;
    readonly characters: Character[];

    constructor({
        itsMe,
        name,
        charactersInfos
    }: PlayerInfos, spriteGenerator: SpriteGenerator) {
        this.itsMe = itsMe;
        this.name = name;
        this.characters = charactersInfos.map(infos => new Character(infos, spriteGenerator));
    }
}
