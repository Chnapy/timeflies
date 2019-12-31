import { BattleData } from '../phaser/scenes/BattleScene';
import { ConnectedScene } from '../phaser/scenes/ConnectedScene';
import { Layout } from './layout/Layout';
import { HUDReducerManager } from './reducers/HUDReducerManager';
import { SpellPane } from './spellPane/SpellPane';
import { TimePane } from './timePane/TimePane';

export interface HUDSceneData {
    battleData: BattleData;
}

export class HUDScene extends ConnectedScene<'HUDScene', HUDSceneData> {

    static DEBUG = true;

    private reducerManager!: HUDReducerManager;

    private layout!: Layout;
    private spellPane!: SpellPane;
    private timePane!: TimePane;

    constructor() {
        super('HUDScene');
    }

    preload(): void {
    }

    create({ battleData }: HUDSceneData): void {

        this.layout = new Layout(
            this,
            10, 8,
            0, 0,
            this.game.scale.width, this.game.scale.height
        );

        this.spellPane = new SpellPane(this);
        this.timePane = new TimePane(this);

        this.layout.addCell(3, 7, 4, 1, this.spellPane);
        this.layout.addCell(8, 4, 2, 4, this.timePane);

        this.reducerManager = new HUDReducerManager(this);
    }

    update(time: number, delta: number): void {
        this.layout.update(time, delta);
    }
}
