
export interface HasGameObject extends Resizable {

    getRootGameObject(): Phaser.GameObjects.GameObject;
}

export interface Resizable {

    resize(x: number, y: number, width: number, height: number): void;
}
