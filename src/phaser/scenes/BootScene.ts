import { Controller } from '../../Controller';
import { BattleRoomState } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';
import { LoadScene } from './LoadScene';

export class BootScene extends ConnectedScene<'BootScene'> {

    constructor() {
        super('BootScene');
    }

    preload(): void {
    }

    create(): void {

        Controller.client.joinOrCreate<BattleRoomState>('battle')
            .then(room => {
                this.start<LoadScene>('LoadScene', room);
            });
    }

    update(time: number, delta: number): void {
    }
}
