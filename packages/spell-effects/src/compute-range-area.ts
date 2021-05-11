import { CharacterId, CharacterVariablesInnerMap, Position, SpellVariables } from '@timeflies/common';
import { Area, Tile } from '@timeflies/tilemap-utils';
import { TiledMap } from 'tiled-types';

export type ComputeRangeAreaParams = Pick<SpellVariables, 'rangeArea' | 'lineOfSight'> & {
    tiledMap: TiledMap;
    characterList: CharacterId[];
    charactersPositions: CharacterVariablesInnerMap<'position'>;
    playingCharacterId: CharacterId;
};

export type CheckTileFn = (position: Position, params: ComputeRangeAreaParams) => boolean;

export const computeRangeArea = (params: ComputeRangeAreaParams, checkTileFn: CheckTileFn) => {
    const {
        tiledMap, characterList, charactersPositions, playingCharacterId,
        rangeArea: rangeAreaValue, lineOfSight
    } = params;

    const characterPosition = charactersPositions[ playingCharacterId ];

    const rawArea = Area.getArea(characterPosition, rangeAreaValue, tiledMap)
        .filter(pos => Tile.getTileTypeFromPosition(pos, tiledMap) === 'default')
        .filter(pos => checkTileFn(pos, params));

    if (!lineOfSight) {
        return rawArea;
    }

    const isPositionOccupied = (pos: Position) => characterList
        .filter(characterId => characterId !== playingCharacterId)
        .some(characterId => {
            return charactersPositions[ characterId ].id === pos.id;
        });

    return rawArea
        .filter(pos => {

            const bresenhamLine = Area.getBresenhamLine(characterPosition, pos, tiledMap);

            const hasObstacle = bresenhamLine
                .some(({ tileType }) => tileType === 'obstacle');
            if (hasObstacle) {
                return false;
            }

            const hasCharacterObstacle = bresenhamLine
                .slice(0, bresenhamLine.length - 1)
                .some(({ position }) => isPositionOccupied(position));

            return !hasCharacterObstacle;
        });
};
