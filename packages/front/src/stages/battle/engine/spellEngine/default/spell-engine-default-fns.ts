import { MiddlewareAPI } from '@reduxjs/toolkit';
import { BresenhamPoint, normalize, TiledManager, Position } from '@timeflies/shared';
import { BattleMapPathAction, BattleStateSpellLaunchAction, BattleStateSpellPrepareAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { SpellAction } from '../../../spellAction/spell-action-reducer';
import { SpellEngineDependencies } from '../spell-engine';

export const getOnTileHover = ({
    extractState,
    extractFutureSpell
}: SpellEngineDependencies<any>, api: MiddlewareAPI) => (action: TileHoverAction) => {

    const { position } = action.payload;

    const { tiledSchema, rangeArea } = extractState(api.getState);

    const isInArea = rangeArea[ position.id ];
    if (!isInArea) {
        return;
    }

    const tiledManager = TiledManager(tiledSchema!);

    const spell = extractFutureSpell(api.getState)!;

    const actionAreaRadius = spell.features.actionArea;

    const actionArea = normalize(tiledManager.getArea(position, actionAreaRadius));

    return api.dispatch(BattleMapPathAction({
        actionArea
    }));
};

export const getOnTileClick = ({
    extractState,
    extractFutureSpell
}: SpellEngineDependencies<any>, api: MiddlewareAPI) => (action: TileClickAction) => {

    const { position } = action.payload;

    const { tiledSchema, rangeArea } = extractState(api.getState);

    const isInArea = !!rangeArea[ position.id ];
    if (!isInArea) {
        return;
    }

    const tiledManager = TiledManager(tiledSchema!);

    const spell = extractFutureSpell(api.getState)!;

    const actionAreaRadius = spell.features.actionArea;

    const actionArea = normalize(tiledManager.getArea(position, actionAreaRadius));

    const spellAction: SpellAction = {
        spell,
        position,
        actionArea
    };

    return api.dispatch(BattleStateSpellLaunchAction({
        spellActions: [ spellAction ]
    }));
};

type IsPositionTargetableFn = (deps: {
    charactersPositionList: Position[];
    futureCharacterPosition: Position;
}) => (bresenhamPoint: BresenhamPoint) => 'yes' | 'no' | 'last';

export const getDefaultIsPositionTargetable: IsPositionTargetableFn = ({ charactersPositionList }) => ({ position, tileType }) => {
    if (tileType === 'obstacle') {
        return 'no';
    }

    if (charactersPositionList.some(p => p.id === position.id)) {
        return 'last';
    }

    return 'yes';
};

type Dependencies = {
    getIsPositionTargetable: IsPositionTargetableFn;
};

export const getOnSpellPrepare = (
    {
        extractState,
        extractFutureAliveCharacterPositionList,
        extractFutureCharacter,
        extractFutureSpell
    }: SpellEngineDependencies<any>,
    api: MiddlewareAPI,
    {
        getIsPositionTargetable
    }: Dependencies = { getIsPositionTargetable: getDefaultIsPositionTargetable }
) => (action: BattleStateSpellPrepareAction) => {

    const { tiledSchema } = extractState(api.getState);

    const futureCharacterPosition = extractFutureCharacter(api.getState)!.position;
    const spellArea = extractFutureSpell(api.getState)!.features.rangeArea;
    const lineOfSight = extractFutureSpell(api.getState)!.features.lineOfSight;
    const charactersPositionList = extractFutureAliveCharacterPositionList(api.getState)
        .filter(p => p.id !== futureCharacterPosition.id);

    const tiledManager = TiledManager(tiledSchema!);

    const isPositionTargetable = getIsPositionTargetable({
        charactersPositionList,
        futureCharacterPosition
    });

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

    return api.dispatch(BattleMapPathAction({
        rangeArea
    }));
};
