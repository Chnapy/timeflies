import { AnyAction } from '@reduxjs/toolkit';
import { BresenhamPoint, denormalize, normalize, Position, TiledManager, TileType } from '@timeflies/shared';
import { BattleMapPathAction, BattleStateSpellLaunchAction, BattleStateSpellPrepareAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { characterAlterLife } from '../../../entities/character/Character';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellLaunchFn } from '../../spellMapping';
import { SpellEngineCreator } from '../spell-engine';

export const spellLaunchSimpleAttack: SpellLaunchFn = ({ spell, actionArea }, { characters }) => {

    const targets = denormalize(characters).filter(c => !!actionArea[ c.position.id ]);

    targets.forEach(t => characterAlterLife(t, -spell.feature.attack));
};

export const spellEngineSimpleAttack: SpellEngineCreator = ({
    extractState,
    extractFutureSpell,
    extractFutureCharacter,
    extractFutureAliveCharacterPositionList
}) => api => {

    const onTileHover = (tilePos: Position, tileType: TileType) => {
        const { tiledSchema, rangeArea } = extractState(api.getState);

        const isInArea = rangeArea[ tilePos.id ];
        if (!isInArea) {
            return;
        }

        const tiledManager = TiledManager(tiledSchema!);

        const actionArea = normalize(tiledManager.getArea(tilePos, 1));

        api.dispatch(BattleMapPathAction({
            actionArea
        }));
    };

    const onTileClick = (tilePos: Position, tileType: TileType) => {
        const { tiledSchema, rangeArea } = extractState(api.getState);

        const isInArea = !!rangeArea[ tilePos.id ];
        if (!isInArea) {
            return;
        }

        const tiledManager = TiledManager(tiledSchema!);

        const spell = extractFutureSpell(api.getState)!;

        const actionArea = normalize(tiledManager.getArea(tilePos, 1));

        const spellAction: SpellAction = {
            spell,
            position: tilePos,
            actionArea
        };

        api.dispatch(BattleStateSpellLaunchAction({
            spellActions: [ spellAction ]
        }));
    };

    return async (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid[ position.id ];

            await onTileHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const state = extractState(api.getState);

            const { position } = action.payload;
            const tile = state.grid[ position.id ];

            await onTileClick(position, tile.tileType);

        } else if (BattleStateSpellPrepareAction.match(action)) {

            const { tiledSchema } = extractState(api.getState);

            const futureCharacterPosition = extractFutureCharacter(api.getState)!.position;
            const spellArea = extractFutureSpell(api.getState)!.feature.area;
            const charactersPos = extractFutureAliveCharacterPositionList(api.getState)
                .filter(p => p.id !== futureCharacterPosition.id);

            const tiledManager = TiledManager(tiledSchema!);

            const isPositionTargetable = ({ position, tileType }: BresenhamPoint): 'yes' | 'no' | 'last' => {

                if (tileType === 'obstacle') {
                    return 'no';
                }

                if (charactersPos.some(p => p.id === position.id)) {
                    return 'last';
                }

                return 'yes';
            };

            const rangeArea = normalize(tiledManager.getArea(futureCharacterPosition, spellArea)
                .filter(p => {

                    const points = tiledManager.getBresenhamLine(futureCharacterPosition, p);

                    for (let i = 0; i < points.length; i++) {
                        const check = isPositionTargetable(points[ i ]);
                        if (check === 'no'
                            || (check === 'last' && i < points.length - 1)) {
                            return false;
                        }
                    }
                    return true;
                }));

            api.dispatch(BattleMapPathAction({
                rangeArea
            }));
        }
    };
};
