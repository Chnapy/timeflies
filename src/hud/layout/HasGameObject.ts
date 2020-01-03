
export interface HasGameObject extends Resizable {

    update?(time: number, delta: number): void;

    getRootGameObject(): Phaser.GameObjects.GameObject;
}

export interface Resizable {

    resize(x: number, y: number, width: number, height: number): void;
}
