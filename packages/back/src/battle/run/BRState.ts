import { Position, SpellActionSnapshot, assertIsDefined, getOrientationFromTo } from '@timeflies/shared';
import { Cycle } from './cycle/Cycle';
import { Character } from './entities/Character';
import { Spell } from './entities/Spell';

export class BRState {

    private readonly cycle: Cycle;

    private readonly characters: Character[];
    private readonly spells: Spell[];

    constructor(cycle: Cycle, characters: Character[]) {
        this.cycle = cycle;
        this.characters = characters;
        this.spells = characters.flatMap(c => c.spells);
    }

    applyCharAction({ spellId, position }: SpellActionSnapshot): void {
        const spell = this.spells.find(s => s.id === spellId);
        assertIsDefined(spell);

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

    // TODO share all these functions
    private applyMoveAction(spell: Spell, position: Position): void {
        const { character } = spell;

        const orientation = getOrientationFromTo(character.position, position);

        character.position = position;
        character.orientation = orientation;
    }

    private applyDefaultAction(spell: Spell, positions: Position[]): void {
        const targets = this.characters.filter(({ isAlive, position: p }) => isAlive
            && positions.some(p2 =>
                p.x === p2.x && p.y === p2.y
            ));

        const { features: { attack } } = spell;

        targets.forEach(t => {
            t.features = {
                ...t.features,
                life: Math.max(t.features.life - attack, 0)
            };
        });

        const deads = targets.filter(t => !t.isAlive);
        this.notifyDeaths(deads);
    }

    private notifyDeaths(deadChars: Character[]): void {
        if (!deadChars.length) {
            return;
        }

        this.cycle.globalTurn.notifyDeaths();
    }
}
