import { Position } from '@shared/Character';
import { SpellType } from '@shared/Spell';
import { SpellLaunch, SpellResult } from '../SpellLaunch';

export class SpellLaunchDefault extends SpellLaunch<Exclude<SpellType, 'move' | 'orientate'>> {

    private timeout?: NodeJS.Timeout;

    async launch(targetPositions: Position[]): Promise<SpellResult> {

        const targets = this.characters
            .filter(({ position: p }) => targetPositions
                .some(tp => p.x === tp.x && p.y === tp.y));

        targets.forEach(target => {
            target.receiveSpell(this.spell);
        });

        return new Promise<SpellResult>(resolve => {
            this.timeout = global.setTimeout(() => {
                targets.forEach(target => target.removeSpell());

                resolve({
                    battleState: true
                });
            }, this.spell.feature.duration);
        });
    }

    protected beforeCancel(): void {
        if (this.timeout)
            clearTimeout(this.timeout);
    }
}