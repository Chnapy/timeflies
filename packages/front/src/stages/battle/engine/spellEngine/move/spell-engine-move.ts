import { AnyAction } from '@reduxjs/toolkit';
import { equals, getOrientationFromTo, Position, TileType, TiledManager } from '@timeflies/shared';
import EasyStar from 'easystarjs';
import { ACCEPTABLE_TILES } from '../../../battleState/battle-action-reducer';
import { BattleMapPathAction, BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { Spell } from '../../../entities/spell/Spell';
import { SpellActionLaunchAction } from '../../../spellAction/spell-action-actions';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellLaunchFn } from '../../spellMapping';
import { SpellEngineCreator } from '../spell-engine';
import { TiledMap } from 'tiled-types';

export const spellLaunchMove: SpellLaunchFn = ({ spell, position }, { characters }) => {
    const character = characters.find(c => c.id === spell.characterId)!;

    const orientation = getOrientationFromTo(character.position, position);

    character.position = position;
    character.orientation = orientation;
};

export const spellEngineMove: SpellEngineCreator = ({
    extractState,
    extractFutureCharacterPositionList,
    extractFutureCharacter,
    extractFutureSpell
}) => api => {

    const finder = new EasyStar.js();

    const calculateEasyStarGrid = (tiledSchema: TiledMap, charactersPositionList: Position[]): number[][] => {
        const { width, height } = tiledSchema;

        const tiledManager = TiledManager(tiledSchema);

        const getTileID = (p: Position, tileType: TileType): number => {
            const obstacle = tileType === 'obstacle'
                || isSomeoneAtXY(p);

            return obstacle ? 1 : ACCEPTABLE_TILES[ 0 ];
        };

        const isSomeoneAtXY = (p: Position): boolean => {
            return charactersPositionList.some(equals(p));
        };

        const easyStarGrid: number[][] = [];

        for (let y = 0; y < height; y++) {
            easyStarGrid[ y ] = [];
            for (let x = 0; x < width; x++) {
                const p: Position = { x, y };
                const tileType = tiledManager.getTileType(p);

                easyStarGrid[ y ][ x ] = getTileID(p, tileType);
            }
        }

        return easyStarGrid;
    };

    const refreshGrid = () => {

        const state = extractState(api.getState);

        const characterPositionList = extractFutureCharacterPositionList(api.getState);

        const easyStarGrid = calculateEasyStarGrid(state.tiledSchema!, characterPositionList);

        finder.setGrid(easyStarGrid);

        finder.setAcceptableTiles(ACCEPTABLE_TILES);
    };

    const calculatePath = async (
        { x: startX, y: startY }: Position,
        { x: endX, y: endY }: Position
    ): Promise<Position[]> => new Promise(resolve => {

        finder.findPath(startX, startY, endX, endY, path => {
            resolve(path ?? []);
        });
        finder.calculate();
    });

    const getPath = async (tilePos: Position, tileType: TileType): Promise<Position[]> => {

        if (tileType !== 'default') {
            return [];
        }

        const mainPos = extractFutureCharacter(api.getState)!.position;

        return (await calculatePath(mainPos, tilePos)).slice(1);
    };

    const onMoveHover = async (tilePos: Position, tileType: TileType) => {

        const path = await getPath(tilePos, tileType);

        if (path.length) {
            api.dispatch(BattleMapPathAction({
                path
            }));
        } else if (extractState(api.getState).path.length) {
            api.dispatch(BattleMapPathAction({
                path: []
            }));
        }
    };

    const onMoveClick = async (tilePos: Position, tileType: TileType, spell: Spell<'future'>) => {

        const path = await getPath(tilePos, tileType);

        if (path.length) {
            const spellActions = path.map((position): SpellAction => ({
                spell,
                position,
                actionArea: [ position ]
            }));

            api.dispatch(BattleStateSpellLaunchAction({
                spellActions
            }));
        }
    };

    refreshGrid();

    return async (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            await onMoveHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const state = extractState(api.getState);

            const spell = extractFutureSpell(api.getState)!;

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            await onMoveClick(position, tile.tileType, spell);

        } else if (SpellActionLaunchAction.match(action)) {

            refreshGrid();
        }
    };
};
