import { makeStyles } from '@material-ui/core';
import { HealthGauge } from '@timeflies/app-ui';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCharacterDeathFade } from '../../../canvas/character-sprite/hooks/use-character-death-fade';
import { useSpritePositionUpdate } from '../../../canvas/character-sprite/hooks/use-sprite-position-update';
import { useBattleViewportContext } from '../../../canvas/view/battle-viewport-context';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { CharacterHudFeedback } from './character-hud-feedback';

export type CharacterHudProps = {
    characterId: CharacterId;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        position: 'relative'
    },
    healthGauge: {
        width: 40,
        height: 8,
        padding: 2,
        marginTop: -32,
        transform: 'translateX(-50%)',
        backgroundColor: palette.background.default
    },
    feedbackWrapper: {
        position: 'absolute',
        left: 0,
        top: -4,
        transform: 'translate(-50%, -100%)'
    }
}));

export const CharacterHud: React.FC<CharacterHudProps> = ({ characterId }) => {
    const classes = useStyles();

    const { scale, dx, dy } = useBattleViewportContext();
    const { x, y } = useSpritePositionUpdate(characterId);

    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);

    const alpha = useCharacterDeathFade(characterId);

    return <div
        className={classes.root}
        style={{
            transform: `translate(${x * scale + dx}px,${y * scale + dy}px)`,
            opacity: alpha
        }}>
        <div className={classes.healthGauge}>
            <HealthGauge
                direction='horizontal'
                health={health}
            />
        </div>

        <div className={classes.feedbackWrapper}>
            <CharacterHudFeedback characterId={characterId} />
        </div>
    </div>;
};
