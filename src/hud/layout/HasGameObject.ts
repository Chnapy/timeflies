
export interface HasGameObject {

    resize(x: number, y: number, width: number, height: number): void;

    getRootGameObject(): Phaser.GameObjects.GameObject;
}
