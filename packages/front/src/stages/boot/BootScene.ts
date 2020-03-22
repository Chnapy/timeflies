import { BootStage } from './BootStage';
import { ConnectedScene } from '../ConnectedScene';

export class BootScene extends ConnectedScene<'BootScene'> {

//@ts-ignore
    private bootStage!: BootStage;

    constructor() {
        super('BootScene');
    }

    preload(): void {
    }

    create(): void {

        this.bootStage = BootStage(this);

    }

    update(time: number, delta: number): void {
    }
}
