import { getOrientationFromTo, Position, createPosition } from '../geo';
import { GridTile } from '../map';
import { DeepReadonly } from '../types';
import { denormalize, Normalized, switchUtil } from '../util';
import { BattleStateEntity } from './battle-state';
import { characterAlterLife, CharacterEntity, characterIsAlive } from './Character';
import { SpellActionSnapshot, SpellEntity, SpellRole } from './Spell';
import { TeamEntity } from './Team';
import { PlayerEntity } from './Player';

export type SpellEffect = (
    spell: SpellEntity,
    snapshot: Omit<SpellActionSnapshot, 'battleHash'>,
    battleState: BattleStateEntity,
    staticEntities: DeepReadonly<{
        teams: Normalized<TeamEntity>;
        players: Normalized<PlayerEntity>;
    }>,
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

    const target = denormalize(characters).find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {
        target.position = launcherFirstPosition;
    }

    launcher.position = position;

    return [];
};

const spellIncitementEffect: SpellEffect = (spell, { position }, { characters }, staticEntities, grid) => {

    const nbrTiles = 3;

    const characterList = denormalize(characters);

    const target = characterList.find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {

        const getNextPosition = switchUtil(target.orientation, {
            bottom: ({ x, y }: Position) => createPosition(x, y + 1),
            top: ({ x, y }: Position) => createPosition(x, y - 1),
            left: ({ x, y }: Position) => createPosition(x - 1, y),
            right: ({ x, y }: Position) => createPosition(x + 1, y),
        });

        for (let i = 0; i < nbrTiles; i++) {
            const nextPosition = getNextPosition(target.position);

            if (grid[ nextPosition.id ]?.tileType !== 'default'
                || characterList.some(c => c.position.id === nextPosition.id)
            ) {
                break;
            }

            target.position = nextPosition;
        }
    }

    return [];
};

const spellTreacherousBlowEffect: SpellEffect = (spell, { position }, { characters }, staticEntities, grid) => {
    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const target = denormalize(characters).find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {
        const { attack } = spell.features;

        if (attack) {
            const finalAttack = getOrientationFromTo(launcher.position, target.position) === target.orientation
                ? attack * 2.5
                : attack;

            characterAlterLife(target, -finalAttack);

            if (!characterIsAlive(target)) {
                return [ target ];
            }
        }

        target.orientation = getOrientationFromTo(target.position, launcher.position);
    }

    return [];
};

const spellPressureEffect: SpellEffect = (spell, { position }, { characters }, { teams, players }, grid) => {
    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const target = denormalize(characters).find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {

        const targetIsTowardLauncher = getOrientationFromTo(target.position, launcher.position) === target.orientation;

        if (targetIsTowardLauncher) {

            const launcherTeam = teams[ players[ launcher.playerId ].teamId ];
            const targetTeam = teams[ players[ target.playerId ].teamId ];

            if (launcherTeam === targetTeam) {

                target.features.actionTime += 500;

            } else if (spell.features.attack) {

                characterAlterLife(target, -spell.features.attack);

                if (!characterIsAlive(target)) {
                    return [ target ];
                }
            }
        }
    }

    return [];
};

export const getSpellEffectFn = (spellRole: SpellRole): SpellEffect => {

    return switchUtil(spellRole, {
        move: spellMoveEffect,
        simpleAttack: spellSimpleAttackEffect,
        switch: spellSwitchEffect,
        incitement: spellIncitementEffect,
        treacherousBlow: spellTreacherousBlowEffect,
        pressure: spellPressureEffect
    });
};
