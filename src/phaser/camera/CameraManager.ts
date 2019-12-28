import { Position } from '../entities/Character';
import { BattleScene } from '../scenes/BattleScene';
import { GameManager } from '../GameManager';

export class CameraManager extends GameManager {

    private camera: Phaser.Cameras.Scene2D.Camera;
    private pointer: Phaser.Input.Pointer;
    private originDragPoint?: Readonly<Position>;

    constructor(scene: BattleScene) {
        super(scene);
        this.camera = scene.cameras.main;
        this.pointer = scene.game.input.activePointer;
    }

    update(time: number, delta: number): void {

        if (this.pointer.isDown && this.pointer.button === 1) {
            if (this.originDragPoint) {
                // move the camera by the amount the mouse has moved since last update		
                this.camera.scrollX += this.originDragPoint.x - this.pointer.position.x;
                this.camera.scrollY += this.originDragPoint.y - this.pointer.position.y;
            }
            // set new drag origin to current position	
            this.originDragPoint = this.pointer.position.clone();
        }
        else if (this.originDragPoint) {
            delete this.originDragPoint;
        }
    }

}
