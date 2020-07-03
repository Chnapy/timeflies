import { SpellEntity, SpellActionSnapshot, SpellRole } from './Spell';
import { CharacterEntity, characterIsAlive, characterAlterLife } from './Character';
import { getOrientationFromTo } from '../geo';
import { denormalize, switchUtil } from '../util';
import { BattleStateEntity } from './battle-state';

export type SpellEffect = (spell: SpellEntity, snapshot: Omit<SpellActionSnapshot, 'battleHash'>, battleState: BattleStateEntity) => CharacterEntity[];

const spellMoveEffect: SpellEffect = (spell, { position }, { characters }) => {
    const character = characters[ spell.characterId ]

    const orientation = getOrientationFromTo(character.position, position);

    character.position = position;
    character.orientation = orientation;

    return [];
};

const spellSimpleAttackEffect: SpellEffect = (spell, { actionArea }, { characters }) => {

    const targets = denormalize<CharacterEntity>(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    targets.forEach(t => characterAlterLife(t, -spell.features.attack));

    return targets.filter(t => !characterIsAlive(t));
};

export const getSpellEffectFn = (spellRole: SpellRole): SpellEffect => {

    return switchUtil(spellRole, {
        move: spellMoveEffect,
        simpleAttack: spellSimpleAttackEffect
    });
};
