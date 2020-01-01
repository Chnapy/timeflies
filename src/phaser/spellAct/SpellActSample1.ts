import { Position } from '../entities/Character';
import { SpellAct, SpellResult } from './SpellAct';

export class SpellActSample1 extends SpellAct<'sampleSpell1'
    | 'sampleSpell2'
    | 'sampleSpell3'> {

    private timeout?: NodeJS.Timeout;

    async launch(targetPositions: Position[]): Promise<SpellResult> {

        const targets = this.characters
            .filter(({ position: p }) => targetPositions
                .some(tp => p.x === tp.x && p.y === tp.y));

        targets.forEach(target => {
            target.life -= this.spell.attaque;
        });

        return new Promise<SpellResult>(resolve => {
            this.timeout = global.setTimeout(() => resolve({
                battleState: true
            }), this.spell.time);
        });
    }

    cancel(): void {
        if (this.timeout)
            clearTimeout(this.timeout);
    }
}