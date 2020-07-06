import { getOrientationFromTo, Position, createPosition } from '../geo';
import { GridTile } from '../map';
import { DeepReadonly } from '../types';
import { denormalize, Normalized, switchUtil } from '../util';
import { BattleStateEntity } from './battle-state';
import { characterAlterLife, CharacterEntity, characterIsAlive } from './Character';
import { SpellActionSnapshot, SpellEntity, SpellRole } from './Spell';
import { TeamEntity } from './Team';
import { PlayerEntity } from './Player';

export type SpellEffect = (data: {
    spell: SpellEntity;
    snapshot: Omit<SpellActionSnapshot, 'battleHash'>;
    battleState: BattleStateEntity;
    staticEntities: DeepReadonly<{
        teams: Normalized<TeamEntity>;
        players: Normalized<PlayerEntity>;
    }>;
    grid: DeepReadonly<Normalized<GridTile>>;
    turnStart: number;
}) => CharacterEntity[];

const spellMoveEffect: SpellEffect = ({ spell, snapshot: { position }, battleState: { characters } }) => {
    const character = characters[ spell.characterId ];

    const orientation = getOrientationFromTo(character.position, position);

    character.position = position;
    character.orientation = orientation;

    return [];
};

const spellSimpleAttackEffect: SpellEffect = ({ spell, snapshot: { actionArea }, battleState: { characters } }) => {

    const targets = denormalize(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    if (spell.features.attack) {
        const attack = spell.features.attack;
        targets.forEach(t => characterAlterLife(t, -attack));
    }

    return targets.filter(t => !characterIsAlive(t));
};

const spellSwitchEffect: SpellEffect = ({ spell, snapshot: { position }, battleState: { characters } }) => {
    const launcher = characters[ spell.characterId ];

    const launcherFirstPosition = launcher.position;

    const target = denormalize(characters).find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {
        target.position = launcherFirstPosition;
    }

    launcher.position = position;

    return [];
};

const spellIncitementEffect: SpellEffect = ({ snapshot: { position }, battleState: { characters }, grid }) => {

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

const spellTreacherousBlowEffect: SpellEffect = ({ spell, snapshot: { position }, battleState: { characters } }) => {
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

const spellPressureEffect: SpellEffect = ({ spell, snapshot: { position }, battleState: { characters }, staticEntities: { teams, players } }) => {
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

const spellHealthSharingEffect: SpellEffect = ({ spell, snapshot: { position, actionArea }, battleState: { characters }, staticEntities: { teams, players } }) => {
    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const { attack } = spell.features;

    if (!attack) {
        return [];
    }

    const characterList = denormalize(characters);

    const actionAreaList = denormalize(actionArea);

    const launcherTeam = teams[ players[ launcher.playerId ].teamId ];

    const isAlly = (character: CharacterEntity) => teams[ players[ character.playerId ].teamId ] === launcherTeam;

    const deadCharacterList: CharacterEntity[] = [];

    const totalDamages = actionAreaList
        .map<number>(p => {

            const target = characterList.find(c => characterIsAlive(c) && c.position.id === p.id && !isAlly(c));

            if (target) {
                const lifeRemoved = Math.min(target.features.life, attack);

                characterAlterLife(target, -attack);

                if (!characterIsAlive(target)) {
                    deadCharacterList.push(target);
                }

                return lifeRemoved;
            }

            return 0;
        })
        .reduce((acc, v) => acc + v, 0);

    const targetAllies = actionAreaList
        .map(p =>
            characterList.find(c => characterIsAlive(c) && c.position.id === p.id && isAlly(c))
        )
        .filter((c): c is CharacterEntity => c !== undefined);

    targetAllies.forEach(target => {
        characterAlterLife(target, totalDamages / targetAllies.length);
    });

    return deadCharacterList;
};

const spellSacrificialGiftEffect: SpellEffect = ({ spell, snapshot: { position, actionArea }, battleState: { characters }, staticEntities: { teams, players } }) => {

    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const { attack } = spell.features;

    if (!attack) {
        return [];
    }

    const characterList = denormalize(characters);
    const target = characterList.find(c => characterIsAlive(c) && c.position.id === position.id);

    if (target) {

        const launcherTeam = teams[ players[ launcher.playerId ].teamId ];

        const isAlly = (character: CharacterEntity) => teams[ players[ character.playerId ].teamId ] === launcherTeam;

        const lifeRemoved = Math.min(target.features.life, attack);
        const spellTime = spell.features.duration;

        characterAlterLife(target, -attack);

        const closeEnemies = characterList.filter(c =>
            c !== target
            && characterIsAlive(c)
            && !isAlly(c)
            && !!actionArea[ c.position.id ]
        );

        closeEnemies.forEach(c => {

            characterAlterLife(c, lifeRemoved / closeEnemies.length);

            c.features.actionTime += spellTime / closeEnemies.length;

        });

        if (!characterIsAlive(target)) {
            return [ target ];
        }
    }

    return [];
};

const spellAttentionAttractionEffect: SpellEffect = ({ spell, snapshot: { position, actionArea }, battleState: { characters } }) => {

    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const heal = -(spell.features.attack ?? 0);

    const targetList = denormalize(characters).filter(c => characterIsAlive(c) && actionArea[ c.position.id ]);

    targetList.forEach(c => {

        characterAlterLife(c, heal);

        if (c !== launcher
            && c.position.id !== position.id) {
            c.orientation = getOrientationFromTo(c.position, position);
        }
    });

    return [];
};

const spellSlumpEffect: SpellEffect = ({ spell, snapshot: { position, actionArea }, battleState: { characters } }) => {

    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const { attack } = spell.features;

    const targets = denormalize(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    targets.forEach(c => {
        if (attack) {
            characterAlterLife(c, -attack);
        }

        c.features.actionTime -= Math.min(2000, c.features.actionTime);
    });

    return targets.filter(c => !characterIsAlive(c));
};

const spellLastResortEffect: SpellEffect = ({ spell, snapshot: { startTime, duration, position, actionArea }, battleState: { characters }, turnStart }) => {

    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const spellEndTime = startTime + duration;

    const totalTime = launcher.features.actionTime;
    const elapsedTime = spellEndTime - turnStart;
    const remainingTime = totalTime - elapsedTime;

    const ratio = 1 - remainingTime / totalTime;

    const { attack } = spell.features;

    const finalAttack = attack && attack * Math.exp(ratio);

    const targets = denormalize(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    targets.forEach(c => {
        if (finalAttack) {
            characterAlterLife(c, -finalAttack);
        }
    });

    return targets.filter(c => !characterIsAlive(c));
};

const spellMotivationEffect: SpellEffect = ({
    spell,
    snapshot: { position, actionArea },
    battleState: { characters }
}) => {

    const launcher = characters[ spell.characterId ];

    launcher.orientation = getOrientationFromTo(launcher.position, position);

    const lifeToRemove = Math.min(20, launcher.features.life);

    const targets = denormalize(characters).filter(c => characterIsAlive(c) && !!actionArea[ c.position.id ]);

    characterAlterLife(launcher, -lifeToRemove);

    const timeToAdd = lifeToRemove / 10 * 1000;

    targets.forEach(c => {

        c.features.actionTime += timeToAdd;
    });

    return characterIsAlive(launcher) ? [] : [ launcher ];
};

export const getSpellEffectFn = (spellRole: SpellRole): SpellEffect => {

    return switchUtil(spellRole, {
        move: spellMoveEffect,
        simpleAttack: spellSimpleAttackEffect,
        switch: spellSwitchEffect,
        incitement: spellIncitementEffect,
        treacherousBlow: spellTreacherousBlowEffect,
        pressure: spellPressureEffect,
        healthSharing: spellHealthSharingEffect,
        sacrificialGift: spellSacrificialGiftEffect,
        attentionAttraction: spellAttentionAttractionEffect,
        slump: spellSlumpEffect,
        lastResort: spellLastResortEffect,
        motivation: spellMotivationEffect
    });
};
