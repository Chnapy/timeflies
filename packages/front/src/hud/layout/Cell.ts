import { HasGameObject } from './HasGameObject';

export abstract class Cell implements HasGameObject {

    protected debugRect?: any;

    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number;

    constructor(scene: any) {
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

    abstract getRootGameObject(): any;

    protected abstract updateSizes(): void;

    protected _debug() {

        // if (!this.debugRect) {
        //     this.debugRect = this.scene.add.rectangle()
        //         .setOrigin(0, 0)
        //         .setStrokeStyle(1, 0xFF0000);
        // }

        // this.debugRect.setPosition(this.x, this.y);
        // this.debugRect.setDisplaySize(this.width, this.height);
    }
}