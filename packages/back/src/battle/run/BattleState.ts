import { assertIsDefined, getOrientationFromTo, Position, SpellActionSnapshot, equals } from '@timeflies/shared';
import { Cycle } from './cycle/Cycle';
import { Character } from './entities/Character';
import { Spell } from './entities/Spell';

export interface BattleState {
    applySpellAction(snapshot: SpellActionSnapshot): Character[];
}

export const BattleState = (cycle: Cycle, characters: Character[]): BattleState => {

    const spells = characters.flatMap(c => c.spells);

    // TODO share all these functions
    const applyMoveAction = (spell: Spell, position: Position): Character[] => {
        const { character } = spell;

        const orientation = getOrientationFromTo(character.position, position);

        character.position = position;
        character.orientation = orientation;

        return [];
    };


    const applySimpleAttack = (spell: Spell, actionArea: Position[]): Character[] => {

        const targets = characters.filter(c => c.isAlive && actionArea.some(p => equals(p)(c.position)));

        targets.forEach(t => t.alterLife(-50));

        return targets.filter(t => !t.isAlive);
    };

    const applyDefaultAction = (spell: Spell, positions: Position[]) => {
        const targets = characters.filter(({ isAlive, position: p }) => isAlive
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

        return targets.filter(t => !t.isAlive);
    };

    return {
        applySpellAction: ({ spellId, position, actionArea }: SpellActionSnapshot): Character[] => {
            const spell = spells.find(s => s.id === spellId);
            assertIsDefined(spell);

            const { staticData: { type } } = spell;

            if (type === 'move') {
                return applyMoveAction(spell, position);
            } else if (type === 'simpleAttack') {
                return applySimpleAttack(spell, actionArea);
            } else if (type === 'orientate') {
                // TODO
            } else {
                // TODO
                // this.applyDefaultAction(spell, position);
            }
            return [];
        }
    };
};
