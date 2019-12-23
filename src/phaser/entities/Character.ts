
export interface Position extends Required<Phaser.Types.Math.Vector2Like> {
}

export class Character {

    readonly name: string;
    readonly sprite: Phaser.GameObjects.Sprite;

    position: Position;

    life: number;
    actionTime: number;

    constructor(
        name: string,
        sprite: Phaser.GameObjects.Sprite,
        position: Position,
        life: number,
        actionTime: number
    ) {
        this.name = name;
        this.sprite = sprite;
        this.position = position;
        this.life = life;
        this.actionTime = actionTime;
    }
}