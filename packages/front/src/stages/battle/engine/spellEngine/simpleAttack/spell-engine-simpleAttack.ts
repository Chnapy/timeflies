import { AnyAction } from '@reduxjs/toolkit';
import { equals, Position, TileType } from '@timeflies/shared';
import { getArea } from '../../../battleState/battle-action-reducer';
import { BattleMapPathAction, BattleStateSpellLaunchAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { Character, characterAlterLife } from '../../../entities/character/Character';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellEngineCreator } from '../spell-engine';

export const spellLaunchSimpleAttack = ({ actionArea, spell }: SpellAction, characterList: Character<'future'>[]) => {

    const targets = characterList.filter(c => actionArea.some(p => equals(p)(c.position)));

    targets.forEach(t => characterAlterLife(t, -spell.feature.attack));
};

export const spellEngineSimpleAttack: SpellEngineCreator = ({
    extractState,
    extractFutureSpell
}) => api => {

    const onTileHover = (tilePos: Position, tileType: TileType) => {
        const { tiledSchema, rangeArea } = extractState(api.getState);

        const isInArea = rangeArea.some(equals(tilePos));
        if (!isInArea) {
            return;
        }

        const actionArea = getArea(tiledSchema!, tilePos, 1);

        api.dispatch(BattleMapPathAction({
            actionArea
        }));
    };

    const onTileClick = (tilePos: Position, tileType: TileType) => {
        const { tiledSchema, rangeArea } = extractState(api.getState);

        const isInArea = rangeArea.some(equals(tilePos));
        if (!isInArea) {
            return;
        }

        const spell = extractFutureSpell(api.getState)!;

        const actionArea = getArea(tiledSchema!, tilePos, 1);

        const spellAction: SpellAction = {
            spell,
            position: tilePos,
            actionArea
        };

        api.dispatch(BattleStateSpellLaunchAction({
            spellActions: [ spellAction ]
        }));
    };

    return (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            onTileHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid.find(t => equals(t.position)(position))!;

            onTileClick(position, tile.tileType);

        }
    };
};
