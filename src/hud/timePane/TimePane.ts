import { HUDScene } from '../HUDScene';
import { Cell } from '../layout/Cell';
import { TimeBar } from './TimeBar';
import { TimeStack } from './TimeStack';

export class TimePane extends Cell {

    static readonly SIZE = {
        width: 70,
        height: 300
    } as const;

    private readonly container: Phaser.GameObjects.Container;
    private readonly timeBar: TimeBar;
    private readonly timeStack: TimeStack;

    constructor(scene: HUDScene) {
        super(scene);

        this.timeBar = new TimeBar(scene);
        this.timeStack = new TimeStack(scene);

        this.container = scene.add.container(-1, -1, [
            this.timeBar.getRootGameObject(),
            this.timeStack.getRootGameObject()
        ]);

        this.updateSizes();
    }

    update(time: number, delta: number): void {
        this.timeBar.update(time, delta);
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    protected updateSizes(): void {
        this.container.setPosition(this.x, this.y);
        this.timeBar.resize(
            this.width - TimePane.SIZE.width, this.height - TimePane.SIZE.height,
            TimePane.SIZE.width, TimePane.SIZE.height
        );
    }
}
