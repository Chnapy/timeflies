import { getOrientationFromTo, Position, createPosition } from '../geo';
import { GridTile } from '../map';
import { DeepReadonly } from '../types';
import { denormalize, Normalized, switchUtil } from '../util';
import { BattleStateEntity } from './battle-state';
import { characterAlterLife, CharacterEntity, characterIsAlive } from './Character';
import { SpellActionSnapshot, SpellEntity, SpellRole } from './Spell';

export type SpellEffect = (
    spell: SpellEntity,
    snapshot: Omit<SpellActionSnapshot, 'battleHash'>,
    battleState: BattleStateEntity,
    grid: DeepReadonly<Normalized<GridTile>>
) => CharacterEntity[];

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

    const launcherFirstPosition = launcher.position;

    const target = denormalize(characters).find(c => c.position.id === position.id);

    if (target) {
        target.position = launcherFirstPosition;
    }

    const orientation = getOrientationFromTo(launcherFirstPosition, position);

    launcher.position = position;
    launcher.orientation = orientation;

    return [];
};

const spellIncitementEffect: SpellEffect = (spell, { position }, { characters }, grid) => {

    const nbrTiles = 3;

    const target = denormalize(characters).find(c => c.position.id === position.id);

    if (target) {

        const getNextPosition = switchUtil(target.orientation, {
            bottom: ({ x, y }: Position) => createPosition(x, y + 1),
            top: ({ x, y }: Position) => createPosition(x, y - 1),
            left: ({ x, y }: Position) => createPosition(x - 1, y),
            right: ({ x, y }: Position) => createPosition(x + 1, y),
        });

        for (let i = 0; i < nbrTiles; i++) {
            const nextPosition = getNextPosition(target.position);

            if (grid[ nextPosition.id ]?.tileType !== 'default') {
                break;
            }

            target.position = nextPosition;
        }
    }

    return [];
};

export const getSpellEffectFn = (spellRole: SpellRole): SpellEffect => {

    return switchUtil(spellRole, {
        move: spellMoveEffect,
        simpleAttack: spellSimpleAttackEffect,
        switch: spellSwitchEffect,
        incitement: spellIncitementEffect
    });
};
