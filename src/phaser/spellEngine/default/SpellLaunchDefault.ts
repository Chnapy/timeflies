import { Position } from '../../entities/Character';
import { SpellLaunch, SpellResult } from '../SpellLaunch';
import { SpellType } from '../../entities/Spell';

export class SpellLaunchDefault extends SpellLaunch<Exclude<SpellType, 'move' | 'orientate'>> {

    private timeout?: NodeJS.Timeout;

    async launch(targetPositions: Position[]): Promise<SpellResult> {

        const targets = this.characters
            .filter(({ position: p }) => targetPositions
                .some(tp => p.x === tp.x && p.y === tp.y));

        targets.forEach(target => {
            target.features.life -= this.spell.attaque;
        });

        return new Promise<SpellResult>(resolve => {
            this.timeout = global.setTimeout(() => resolve({
                battleState: true
            }), this.spell.time);
        });
    }

    protected beforeCancel(): void {
        if (this.timeout)
            clearTimeout(this.timeout);
    }
}