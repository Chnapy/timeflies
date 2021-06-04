import { makeStyles } from '@material-ui/core';
import { Position } from '@timeflies/common';
import React from 'react';
import { useTiledMapAssets } from '../../../assets-loader/hooks/use-tiled-map-assets';
import { useBattleViewportContext } from '../../../canvas/view/battle-viewport-context';
import { characterAliveListSelector } from '../../../hooks/character-alive-list-selector';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { BattleFeedbackTarget } from './battle-feedback-target';

const useStyles = makeStyles(() => ({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        pointerEvents: 'none'
    },
    feedback: {
        position: 'absolute',
        transform: `translate(-50%, -100%)`
    }
}));

export const BattleFeedbackPool: React.FC = () => {
    const classes = useStyles();

    const tilesize = useTiledMapAssets()?.schema.tileheight;
    const { dx, dy, scale } = useBattleViewportContext();

    const characterAliveList = useCurrentEntities(characterAliveListSelector);
    const charactersPositions = useCurrentEntities(entities => entities.characters.position);

    const spellActionEffectList = useBattleSelector(battle => battle.spellActionEffectList);
    const spellActionEffects = useBattleSelector(battle => battle.spellActionEffects);

    if (!tilesize) {
        return null;
    }

    const isTargetingCharacters = (targetPos: Position) => characterAliveList.some(characterId => charactersPositions[ characterId ].id === targetPos.id);

    const spellActionsPos = spellActionEffectList
        .map(startTime => spellActionEffects[ startTime ].spellAction.targetPos)
        .reduce<Position[]>((acc, targetPos) => {

            if (!acc.some(pos => pos.id === targetPos.id)
                && !isTargetingCharacters(targetPos)) {
                acc.push(targetPos);
            }

            return acc;
        }, []);

    return <div className={classes.root}>
        {spellActionsPos.map(({ x, y, id: posId }) => {

            const left = (x + 0.5) * tilesize * scale + dx;
            const top = y * tilesize * scale + dy - 8;

            return <div
                key={posId}
                className={classes.feedback}
                style={{ left, top }}
            >
                <BattleFeedbackTarget posId={posId} />
            </div>;
        })}
    </div>
};
