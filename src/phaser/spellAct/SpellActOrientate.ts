import { SpellAct, SpellResult } from './SpellAct';
import { Position } from '../entities/Character';

export class SpellActOrientate extends SpellAct<'orientate'> {

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        return {};
    }

    cancel(): void {
    }
}