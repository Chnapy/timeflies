import { makeStyles } from '@material-ui/core';
import { HealthGauge } from '@timeflies/app-ui';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCurrentEntities } from '../../../hooks/use-entities';

export type CharacterHudProps = {
    characterId: CharacterId;
};

const useStyles = makeStyles(({ palette }) => ({
    healthGauge: {
        width: 40,
        height: 8,
        padding: 2,
        marginTop: -32,
        transform: 'translateX(-50%)',
        backgroundColor: palette.background.default
    }
}));

export const CharacterHud: React.FC<CharacterHudProps> = ({ characterId }) => {
    const classes = useStyles();
    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);

    return <span>
        <div className={classes.healthGauge}>
            <HealthGauge
                direction='horizontal'
                health={health}
            />
        </div>
    </span>;
};
