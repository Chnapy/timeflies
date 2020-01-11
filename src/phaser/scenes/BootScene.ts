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

        // TODO
        Controller.client.joinOrCreate<BattleRoomState>('battle')
            .then(room => {

                room.onMessage(message => {
                    if(message.type === 'battle_load') {

                        Controller.dispatch<LoadLaunchAction>({
                            type: 'load/launch',
                            room
                        });

                    }
                });
            })
            .catch(e => console.error(e));
    }

    update(time: number, delta: number): void {
    }
}
