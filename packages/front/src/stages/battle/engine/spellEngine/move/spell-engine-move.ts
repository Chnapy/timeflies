import { AnyAction } from '@reduxjs/toolkit';
import { equals, Position, TileType, getOrientationFromTo } from '@timeflies/shared';
import EasyStar from 'easystarjs';
import { ACCEPTABLE_TILES } from '../../../battleState/battle-action-reducer';
import { BattleMapPathAction, BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { Spell } from '../../../entities/spell/Spell';
import { BattleCommitAction } from '../../../snapshot/snapshot-manager-actions';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellEngineCreator } from '../spell-engine';
import { Character } from '../../../entities/character/Character';

export const spellLaunchMove = ({ spell, position }: SpellAction, characterList: Character<'future'>[]) => {
    const character = characterList.find(c => c.id === spell.characterId)!;

    const orientation = getOrientationFromTo(character.position, position);

    character.position = position;
    character.orientation = orientation;
};

export const spellEngineMove: SpellEngineCreator = ({
    extractState,
    extractFutureCharacter,
    extractFutureSpell
}) => api => {

    const finder = new EasyStar.js();

    const refreshGrid = () => {

        const state = extractState(api.getState);

        const esGrid = state.easyStarGrid.map(arr => arr.map(v => v));

        finder.setGrid(esGrid);

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

    return (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            onMoveHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const state = extractState(api.getState);

            const spell = extractFutureSpell(api.getState)!;

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            onMoveClick(position, tile.tileType, spell);

        } else if (BattleCommitAction.match(action)) {

            refreshGrid();
        }
    };
};
