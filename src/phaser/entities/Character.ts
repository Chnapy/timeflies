import { SpriteGenerator } from './Player';
import { SortInfos, Sort } from './Sort';

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export interface Position extends Required<Phaser.Types.Math.Vector2Like> {
}

export interface CharacterInfos {
    isMine: boolean;
    name: string;
    type: CharacterType;
    position: Position;
    life: number;
    actionTime: number;
    sortsInfos: SortInfos[];
}

export class Character {

    readonly isMine: boolean;
    readonly type: CharacterType;
    readonly name: string;

    position: Position;
    life: number;
    actionTime: number;

    readonly sorts: Sort[];

    readonly sprite: Phaser.GameObjects.Sprite;

    constructor({
        isMine, name, type, position, life, actionTime, sortsInfos
    }: CharacterInfos, { spriteGenerate, tileToWorldPosition }: SpriteGenerator) {
        this.isMine = isMine;
        this.name = name;
        this.type = type;

        this.position = position;
        this.life = life;
        this.actionTime = actionTime;

        this.sorts = sortsInfos.map(infos => new Sort(infos));

        const worldPosition = tileToWorldPosition(position, true);
        this.sprite = spriteGenerate(worldPosition.x + 0.5, worldPosition.y + 0.5, type);
    }
}