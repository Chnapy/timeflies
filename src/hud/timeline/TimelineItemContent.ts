import { Character } from '../../phaser/entities/Character';
import { HUDScene } from '../HUDScene';
import { ReducerManager } from '../../ReducerManager';
import { HasGameObject } from '../layout/HasGameObject';

export class TimelineItemContent extends ReducerManager<HUDScene> implements HasGameObject {

    private readonly character: Character;

    private readonly container: Phaser.GameObjects.Container;

    private readonly rect: Phaser.GameObjects.Rectangle;
    private readonly text: Phaser.GameObjects.Text;

    constructor(scene: HUDScene, character: Character) {
        super(scene);
        this.character = character;

        this.rect = scene.add.rectangle(0, 0)
            .setOrigin(0, 0)
            .setFillStyle(0x888888, 0.8);

        this.text = scene.add.text(0, 0, 'temp', {
            fontSize: 10,
            fontFamily: 'Arial'
        });

        this.container = new Phaser.GameObjects.Container(scene, undefined, undefined, [
            this.rect,
            this.text
        ]);
    }

    update(): void {
        const { isMine, actionTime, orientation, position, type, team } = this.character;
        this.text.setText(`
        ${isMine ? 'IsMine\n' : ''}
        ${type} ${team.name}\n
        T:${actionTime}\n
        P:${position.x}-${position.y} - O:${orientation}
        `);
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.container.setPosition(x, y);
        this.rect
            .setPosition(0, 0)
            .setDisplaySize(width, height);
        this.text
            .setPosition(-20, -12);
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }
}
