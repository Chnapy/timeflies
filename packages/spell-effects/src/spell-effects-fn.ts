import { CharacterId, CharacterUtils, CharacterVariables, ObjectTyped, Position, SpellVariables } from '@timeflies/common';
import { Area, Tile } from '@timeflies/tilemap-utils';
import { computeActionArea } from './compute-action-area';
import { CheckTileFn } from './compute-range-area';
import { SpellEffect, SpellEffectFnParams } from './spell-effects-params';

export const createSpellEffectHelper = (params: SpellEffectFnParams) => {
    const { context, partialSpellAction: spellAction } = params;
    const { currentTurn, staticState, state, map } = context;

    let _actionArea: Position[] | undefined;
    const getActionArea = () => {
        if (!_actionArea) {
            _actionArea = computeActionArea(params);
        }
        return _actionArea!;
    };

    const getLauncher = () => getCharacterById(currentTurn.characterId);

    const getCharacterTeamColor = (characterId: CharacterId) => staticState.players[ staticState.characters[ characterId ].playerId ].teamColor;

    const getCharacterById = (characterId: CharacterId) => ({
        ...staticState.characters[ characterId ],
        ...ObjectTyped.entries(state.characters)
            .reduce((acc, [ variableName, variableMap ]) => {
                (acc[ variableName ] as any) = variableMap[ characterId ];

                return acc;
            }, {} as CharacterVariables),
        getRelation: () => characterId === currentTurn.characterId
            ? 'me'
            : getCharacterTeamColor(characterId) === getCharacterTeamColor(currentTurn.characterId)
                ? 'ally' : 'enemy'
    });

    const isPositionOccupied = (position: Position) => Object.values(state.characters.position).some(characterPosition => characterPosition.id === position.id);

    const getHitCharacters = () => {
        const actionArea = getActionArea();

        return Object.entries(state.characters.position)
            .filter(([ characterId, position ]) =>
                actionArea.some(pos => pos.id === position.id))
            .map(([ characterId ]) => getCharacterById(characterId));
    };

    const getBresenhamLine = (start: Position, end: Position) =>
        Area.getBresenhamLine(start, end, map.tiledMap);

    const getDefaultDuration = () => state.spells.duration[ spellAction.spellId ];

    return {
        params,
        getActionArea,
        setActionArea: (actionArea: Position[]) => { _actionArea = actionArea },
        getBresenhamLine,
        getLauncher,
        getDefaultDuration,
        getSpell: () => {
            const { spellId } = spellAction;

            return {
                ...staticState.spells[ spellId ],
                ...ObjectTyped.entries(state.spells)
                    .reduce((acc, [ variableName, variableMap ]) => {
                        (acc[ variableName ] as any) = variableMap[ spellId ];

                        return acc;
                    }, {} as SpellVariables)
            };
        },
        getHitCharactersAlive: () => {
            return getHitCharacters()
                .filter(character => CharacterUtils.isAlive(character.health));
        },
        getAllCharacterAliveIdList: () => {
            return Object.entries(state.characters.health)
                .filter(([ characterId, health ]) => CharacterUtils.isAlive(health))
                .map(([ characterId ]) => characterId);
        },
        targetPos: spellAction.targetPos,
        isPositionAccessible: (position: Position) => {
            const tileType = Tile.getTileTypeFromPosition(position, map.tiledMap);

            return tileType === 'default' && !isPositionOccupied(position);
        }
    };
};
export type SpellEffectHelper = ReturnType<typeof createSpellEffectHelper>;

type PartialSpellEffect = Partial<SpellEffect>;

export type SpellEffectFn = (helper: SpellEffectHelper) => Promise<PartialSpellEffect>;

export type SpellEffectItem = {
    rangeArea?: CheckTileFn;
    effect: SpellEffectFn;
};
