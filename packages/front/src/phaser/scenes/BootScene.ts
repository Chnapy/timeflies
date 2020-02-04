import { BattleLoadSAction } from '@timeflies/shared'
import { Controller } from '../../Controller';
import { ReducerManager } from '../../ReducerManager';
import { ConnectedScene } from './ConnectedScene';
import { LoadLaunchAction, LoadScene } from './LoadScene';
import { MatchmakerEnterCAction } from '@timeflies/shared'
import { PlayerInfos } from '@timeflies/shared'
import { SetIDCAction } from '@timeflies/shared'

export let playerInfos: PlayerInfos;

export class BootScene extends ConnectedScene<'BootScene'> {

    private reducerManager!: ReducerManager<BootScene>;

    constructor() {
        super('BootScene');
    }

    preload(): void {
    }

    create(): void {
        this.reducerManager = new class extends ReducerManager<BootScene> {
            private readonly onLoadStartAction = this.reduce<LoadLaunchAction>('load/launch', ({
                payload
            }) => {
                playerInfos = payload.playerInfos;
                this.scene.start<LoadScene>('LoadScene', payload);
            });
        }(this);

        Controller.client.waitConnect().then(() => {

            Controller.client.send<SetIDCAction>({
                type: 'set-id',
                id: Math.random() + ''
            });

            Controller.client.on<BattleLoadSAction>('battle-load', ({
                payload
            }) => {

                Controller.dispatch<LoadLaunchAction>({
                    type: 'load/launch',
                    payload
                });

            });

            Controller.client.send<MatchmakerEnterCAction>({
                type: 'matchmaker/enter'
            });

        });
    }

    update(time: number, delta: number): void {
    }
}
