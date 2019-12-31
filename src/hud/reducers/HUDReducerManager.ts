import { ReducerManager } from '../../ReducerManager';
import { HUDScene } from '../HUDScene';

export class HUDReducerManager extends ReducerManager<HUDScene> {

    constructor(
        scene: HUDScene
    ) {
        super(scene);
    }
}
