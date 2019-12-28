import { BattleScene, BattleData } from '../phaser/scenes/BattleScene';

interface DataState {
    time: number;
    data: BattleData;
}

export class DataStateManager {

    private readonly scene: BattleScene;
    private readonly dataStateStack: DataState[];

    constructor(scene: BattleScene) {
        this.scene = scene;
        this.dataStateStack = [];
    }

    init(firstData: BattleData): void {
        this.dataStateStack.push({
            time: 0,
            data: firstData
        });
    }

    commit(): void {
        this.dataStateStack.push({
            time: Date.now(),
            data: this.extractDataState()
        });
    }

    rollbackByTime(time: number): void {

        const fromWhereToDelete = this.dataStateStack.findIndex(ds => ds.time >= time);
        if (fromWhereToDelete === -1) {
            return;
        }

        this.rollback(fromWhereToDelete);
    }

    rollbackLast(nb: number = 1): void {
        this.rollback(Math.max(this.dataStateStack.length - nb, 0));
    }

    private rollback(fromWhereToDelete: number): void {
        this.dataStateStack.splice(fromWhereToDelete);

        this.resetFrom(this.dataStateStack[ this.dataStateStack.length - 1 ]);
    }

    private extractDataState(): BattleData {
        return this.scene.getInfos();
    }

    private resetFrom(dataState: DataState): void {
        this.scene.updateInfos(dataState.data);
    }
}