import { BattleScene, BattleSnapshot } from '../phaser/scenes/BattleScene';

interface DataState {
    time: number;
    snapshot: BattleSnapshot;
}

export class DataStateManager {

    private readonly scene: BattleScene;
    private readonly dataStateStack: DataState[];

    constructor(scene: BattleScene, firstSnap: BattleSnapshot) {
        this.scene = scene;
        this.dataStateStack = [{
            time: 0,
            snapshot: firstSnap
        }];
    }

    commit(time: number = Date.now()): void {
        this.dataStateStack.push({
            time,
            snapshot: this.extractSnapshot()
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

    private extractSnapshot(): BattleSnapshot {
        return this.scene.getSnapshot();
    }

    private resetFrom(dataState: DataState): void {
        this.scene.updateFromSnapshot(dataState.snapshot);
    }
}