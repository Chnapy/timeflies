import { HUDScene } from '../HUDScene';
import { HasGameObject } from './HasGameObject';
import { ReducerManager } from '../../ReducerManager';

export abstract class Cell extends ReducerManager<HUDScene> implements HasGameObject {

    protected debugRect?: Phaser.GameObjects.Rectangle;

    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number;

    constructor(scene: HUDScene) {
        super(scene);
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.updateSizes();
        this._debug();
    }

    update(time: number, delta: number): void {
    }

    abstract getRootGameObject(): Phaser.GameObjects.GameObject;

    protected abstract updateSizes(): void;

    protected _debug() {
        if (!HUDScene.DEBUG) {
            return;
        }

        if (!this.debugRect) {
            this.debugRect = this.scene.add.rectangle()
                .setOrigin(0, 0)
                .setStrokeStyle(1, 0xFF0000);
        }

        this.debugRect.setPosition(this.x, this.y);
        this.debugRect.setDisplaySize(this.width, this.height);
    }
}