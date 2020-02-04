import { Position } from '@timeflies/shared'
import { SpellLaunch, SpellResult } from '../SpellLaunch';

export class SpellLaunchOrientate extends SpellLaunch<'orientate'> {

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        return {};
    }

    protected beforeCancel(): void {
    }
}