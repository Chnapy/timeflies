
export class SpellLaunchDefault  {

    private timeout?: NodeJS.Timeout;

    // async launch(targetPositions: Position[]): Promise<SpellResult> {

    //     const targets = this.characters
    //         .filter(({ position: p }) => targetPositions
    //             .some(tp => p.x === tp.x && p.y === tp.y));

    //     targets.forEach(target => {
    //         // target.receiveSpell(this.spell);
    //     });

    //     return new Promise<SpellResult>(resolve => {
    //         this.timeout = global.setTimeout(() => {
    //             // targets.forEach(target => target.removeSpell());

    //             resolve({
    //                 battleState: true
    //             });
    //         }, this.spell.feature.duration);
    //     });
    // }

    // protected beforeCancel(): void {
    //     if (this.timeout)
    //         clearTimeout(this.timeout);
    // }
}