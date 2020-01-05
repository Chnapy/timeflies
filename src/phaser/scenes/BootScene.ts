import { Controller } from '../../Controller';
import { ReducerManager } from '../../ReducerManager';
import { BattleRoomState } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';
import { LoadScene, LoadLaunchAction } from './LoadScene';

export class BootScene extends ConnectedScene<'BootScene'> {

    private reducerManager!: ReducerManager<BootScene>;

    constructor() {
        super('BootScene');
    }

    preload(): void {
    }

    create(): void {
        this.reducerManager = new class extends ReducerManager<BootScene> {
            private readonly onLoadStartAction = this.reduce<LoadLaunchAction>('load/launch', ({ room }) => {
                this.scene.start<LoadScene>('LoadScene', room);
            });
        }(this);

        Controller.client.joinOrCreate<BattleRoomState>('battle')
            .then(room => {
                Controller.dispatch<LoadLaunchAction>({
                    type: 'load/launch',
                    room
                });
            });
    }

    update(time: number, delta: number): void {
    }
}
