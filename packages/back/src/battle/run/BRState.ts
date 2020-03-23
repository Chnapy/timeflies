import { Position, SpellActionSnapshot } from '@timeflies/shared';
import { BRCycle } from './cycle/BRCycle';
import { BCharacter } from './entities/BCharacter';
import { BSpell } from './entities/BSpell';

export class BRState {

    private readonly cycle: BRCycle;

    private readonly characters: BCharacter[];
    private readonly spells: BSpell[];

    constructor(cycle: BRCycle, characters: BCharacter[]) {
        this.cycle = cycle;
        this.characters = characters;
        this.spells = characters.flatMap(c => c.spells);
    }

    applyCharAction({ spellId, position }: SpellActionSnapshot): void {
        const spell = this.spells.find(s => s.id === spellId);
        if (!spell) {
            throw new Error();
        }

        const { staticData: { type } } = spell;

        if (type === 'move') {
            this.applyMoveAction(spell, position);
        } else if (type === 'orientate') {
            // TODO
        } else {
            // TODO
            // this.applyDefaultAction(spell, position);
        }
    }

    private applyMoveAction(spell: BSpell, position: Position): void {
        const { character } = spell;

        character.position = position;
    }

    private applyDefaultAction(spell: BSpell, positions: Position[]): void {
        const targets = this.characters.filter(({ isAlive, position: p }) => isAlive
            && positions.some(p2 =>
                p.x === p2.x && p.y === p2.y
            ));

        const { features: { attack } } = spell;

        targets.forEach(t => {
            t.features.life -= attack;
        });

        const deads = targets.filter(t => !t.isAlive);
        this.notifyDeaths(deads);
    }

    private notifyDeaths(deadChars: BCharacter[]): void {
        if (!deadChars.length) {
            return;
        }

        this.cycle.globalTurn.notifyDeaths();
    }
}
