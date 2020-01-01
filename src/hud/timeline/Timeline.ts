import { BattleTurnStartAction } from '../../phaser/battleReducers/BattleReducerManager';
import { BattleData } from '../../phaser/scenes/BattleScene';
import { HUDScene } from '../HUDScene';
import { Cell } from '../layout/Cell';
import { TimelineItem } from './TimelineItem';

export class Timeline extends Cell {

    private readonly container: Phaser.GameObjects.Container;

    private readonly items: TimelineItem[];

    constructor(scene: HUDScene, battleData: BattleData) {
        super(scene);
        this.items = battleData.characters.map(c => new TimelineItem(scene, c));
        this.container = scene.add.container(-1, -1, this.items.map(item => item.getRootGameObject()));
    }

    update(time, delta): void {
        this.items.forEach(it => it.update(time, delta));
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    protected updateSizes(): void {
        this.container.setPosition(this.x, this.y);
        const itemHeight = TimelineItem.HEIGHT;
        const baseY = this.height - itemHeight * this.items.length - 20;
        this.items.forEach((item, i) => {
            item.resize(10, baseY + itemHeight * i, this.width - 20, itemHeight);
        });
    }

    private onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({
        character
    }) => {
        this.items.sort((a, b) => a.character.id === character.id ? 1 : -1);

        this.updateSizes();
    });
}
