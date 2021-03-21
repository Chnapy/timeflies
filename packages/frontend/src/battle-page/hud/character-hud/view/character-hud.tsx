import { makeStyles } from '@material-ui/core';
import { HealthGauge } from '@timeflies/app-ui';
import { CharacterId } from '@timeflies/common';
import React from 'react';
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
    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);

    return <div className={classes.root}>
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
