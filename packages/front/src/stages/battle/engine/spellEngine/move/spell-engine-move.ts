import { createPosition, normalize, Position, TiledManager, TileType } from '@timeflies/shared';
import EasyStar from 'easystarjs';
import { TiledMap } from 'tiled-types';
import { GameState } from '../../../../../game-state';
import { BattleState } from '../../../../../ui/reducers/battle-reducers/battle-reducer';
import { ACCEPTABLE_TILES } from '../../../battleState/battle-action-reducer';
import { BattleMapPathAction, BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { getTurnRemainingTime } from '../../../cycle/cycle-reducer';
import { Spell } from '../../../entities/spell/Spell';
import { SpellActionLaunchAction } from '../../../spellAction/spell-action-actions';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellEngineCreator } from '../spell-engine';

export type CreateTileTypeGetter = (tiledSchema: TiledMap) => (position: Position) => TileType;

type Dependencies = {
    createTileTypeGetter?: CreateTileTypeGetter;
    extractBattleState?: (getState: () => GameState) => BattleState;
};

const defaultCreateTileTypeGetter: CreateTileTypeGetter = tiledSchema => {
    const tiledManager = TiledManager(tiledSchema);

    return tiledManager.getTileType;
};

export const spellEngineMove: SpellEngineCreator<Dependencies> = ({
    extractState,
    extractGrid,
    extractFutureAliveCharacterPositionList,
    extractFutureCharacter,
    extractFutureSpell,
    createTileTypeGetter = defaultCreateTileTypeGetter,
    extractBattleState = getState => getState().battle
}) => api => {

    const finder = new EasyStar.js();

    const calculateEasyStarGrid = (tiledSchema: TiledMap, charactersPositionList: Position[]): number[][] => {
        const { width, height } = tiledSchema;

        const getTileType = createTileTypeGetter(tiledSchema);

        const getTileID = (p: Position, tileType: TileType): number => {
            const obstacle = tileType === 'obstacle'
                || isSomeoneAtXY(p);

            return obstacle ? 1 : ACCEPTABLE_TILES[ 0 ];
        };

        const isSomeoneAtXY = (p: Position): boolean => {
            return charactersPositionList.some(cp => cp.id === p.id);
        };

        const easyStarGrid: number[][] = [];

        for (let y = 0; y < height; y++) {
            easyStarGrid[ y ] = [];
            for (let x = 0; x < width; x++) {
                const p = createPosition(x, y);
                const tileType = getTileType(p);

                easyStarGrid[ y ][ x ] = getTileID(p, tileType);
            }
        }

        return easyStarGrid;
    };

    const refreshGrid = () => {
        const state = extractState(api.getState);

        const characterPositionList = extractFutureAliveCharacterPositionList(api.getState);

        const easyStarGrid = calculateEasyStarGrid(state.tiledSchema!, characterPositionList);

        finder.setGrid(easyStarGrid);

        finder.setAcceptableTiles(ACCEPTABLE_TILES);
    };

    /**
     * Important note for testing:
     * finder.calculate() run a setTimeout(),
     * so jest.runOnlyPendingTimers() may have to be used !
     */
    const calculatePath = (
        { x: startX, y: startY }: Position,
        { x: endX, y: endY }: Position
    ): Promise<Position[]> => new Promise(resolve => {
        finder.findPath(startX, startY, endX, endY, path => {
            resolve((path ?? []).map(({ x, y }) => createPosition(x, y)));
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

    const getTimeFilteredPath = (path: Position[]): Position[] => {

        const spell = extractFutureSpell(api.getState);

        if (!spell) {
            return [];
        }

        const remainingTime = getTurnRemainingTime(extractBattleState(api.getState), 'future');

        const nbrTiles = Number.parseInt(remainingTime / spell.features.duration + '');

        return path.slice(0, nbrTiles);
    };

    const onMoveHover = async (tilePos: Position, tileType: TileType) => {

        const initialPath = await getPath(tilePos, tileType);

        const path = getTimeFilteredPath(initialPath);

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

    const onMoveClick = (spell: Spell<'future'>) => {

        const initialPath = extractState(api.getState).path;

        const path = getTimeFilteredPath(initialPath);

        if (path.length) {
            const spellActions = path.map((position): SpellAction => ({
                spell,
                position,
                actionArea: normalize([ position ])
            }));

            api.dispatch(BattleStateSpellLaunchAction({
                spellActions
            }));
        }
    };

    refreshGrid();

    return async action => {

        if (TileHoverAction.match(action)) {
            const grid = extractGrid(api.getState);

            const { position } = action.payload;
            const tile = grid[ position.id ]

            await onMoveHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const spell = extractFutureSpell(api.getState)!;

            onMoveClick(spell);

        } else if (SpellActionLaunchAction.match(action)) {

            refreshGrid();
        }
    };
};
