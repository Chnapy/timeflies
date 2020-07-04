import { AnyAction } from '@reduxjs/toolkit';
import { BresenhamPoint, normalize, Position, TiledManager, TileType } from '@timeflies/shared';
import { BattleMapPathAction, BattleStateSpellLaunchAction, BattleStateSpellPrepareAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellEngineCreator } from '../spell-engine';

export const spellEngineSwitch: SpellEngineCreator = ({
    extractState,
    extractGrid,
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

        const spell = extractFutureSpell(api.getState)!;

        const actionAreaRadius = spell.features.actionArea;

        const actionArea = normalize(tiledManager.getArea(tilePos, actionAreaRadius));

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

        const actionAreaRadius = spell.features.actionArea;

        const actionArea = normalize(tiledManager.getArea(tilePos, actionAreaRadius));

        const spellAction: SpellAction = {
            spell,
            position: tilePos,
            actionArea
        };

        return api.dispatch(BattleStateSpellLaunchAction({
            spellActions: [ spellAction ]
        }));
    };

    return async (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            const grid = extractGrid(api.getState);

            const { position } = action.payload;
            const tile = grid[ position.id ];

            await onTileHover(position, tile.tileType);

        } else if (TileClickAction.match(action)) {
            const grid = extractGrid(api.getState);

            const { position } = action.payload;
            const tile = grid[ position.id ];

            await onTileClick(position, tile.tileType);

        } else if (BattleStateSpellPrepareAction.match(action)) {

            const { tiledSchema } = extractState(api.getState);

            const futureCharacterPosition = extractFutureCharacter(api.getState)!.position;
            const spellArea = extractFutureSpell(api.getState)!.features.rangeArea;
            const lineOfSight = extractFutureSpell(api.getState)!.features.lineOfSight;
            const charactersPos = extractFutureAliveCharacterPositionList(api.getState)
                .filter(p => p.id !== futureCharacterPosition.id);

            const tiledManager = TiledManager(tiledSchema!);

            const isPositionTargetable = ({ position, tileType }: BresenhamPoint): 'yes' | 'no' | 'last' => {

                if (tileType === 'obstacle') {
                    return 'no';
                }

                const dx = Math.abs(futureCharacterPosition.x - position.x);
                const dy = Math.abs(futureCharacterPosition.y - position.y);
                if(dx !== dy) {
                    return 'no';
                }

                if (charactersPos.some(p => p.id === position.id)) {
                    return 'last';
                }

                return 'yes';
            };

            const rangeAreaRaw = tiledManager.getArea(futureCharacterPosition, spellArea);

            const rangeArea = normalize(lineOfSight
                ? rangeAreaRaw
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
                    })
                : rangeAreaRaw
            );

            api.dispatch(BattleMapPathAction({
                rangeArea
            }));
        }
    };
};
