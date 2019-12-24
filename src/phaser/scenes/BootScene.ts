import { ConnectedScene } from './ConnectedScene';
import { LoadScene } from './LoadScene';
import { SampleData } from './SampleBattleData';

export class BootScene extends ConnectedScene<'BootScene'> {

    constructor() {
        super('BootScene');
    }

    preload(): void {
    }

    create(): void {
        this.start<LoadScene>('LoadScene', SampleData);
    }

    update(time: number, delta: number): void {
    }
}
