import { SpellLaunch, SpellResult } from '../SpellLaunch';
import { Position } from '../../entities/Character';

export class SpellLaunchOrientate extends SpellLaunch<'orientate'> {

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        return {};
    }

    protected beforeCancel(): void {
    }
}