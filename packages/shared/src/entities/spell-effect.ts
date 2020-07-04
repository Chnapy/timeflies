import { SpellEntity, SpellActionSnapshot, SpellRole } from './Spell';
import { CharacterEntity, characterIsAlive, characterAlterLife } from './Character';
import { getOrientationFromTo } from '../geo';
import { denormalize, switchUtil } from '../util';
import { BattleStateEntity } from './battle-state';

export type SpellEffect = (spell: SpellEntity, snapshot: Omit<SpellActionSnapshot, 'battleHash'>, battleState: BattleStateEntity) => CharacterEntity[];

const spellMoveEffect: SpellEffect = (spell, { position }, { characters }) => {
    const character = characters[ spell.characterId ];

    const orientation = getOrientationFromTo(character.position, position);

    character.position = position;
    character.orientation = orientation;

    return [];
};

const spellSimpleAttackEffect: SpellEffect = (spell, { actionArea }, { characters }) => {

    const targets = denormalize(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    if (spell.features.attack) {
        const attack = spell.features.attack;
        targets.forEach(t => characterAlterLife(t, -attack));
    }

    return targets.filter(t => !characterIsAlive(t));
};

const spellSwitchEffect: SpellEffect = (spell, { position }, { characters }) => {
    const launcher = characters[ spell.characterId ];

    const oldPosition = launcher.position;

    const orientation = getOrientationFromTo(launcher.position, position);

    launcher.position = position;
    launcher.orientation = orientation;

    const target = denormalize(characters).find(c => c.position.id === oldPosition.id);

    if(target) {
        target.position = oldPosition;
    }

    return [];
};

export const getSpellEffectFn = (spellRole: SpellRole): SpellEffect => {

    return switchUtil(spellRole, {
        move: spellMoveEffect,
        simpleAttack: spellSimpleAttackEffect,
        switch: spellSwitchEffect
    });
};
