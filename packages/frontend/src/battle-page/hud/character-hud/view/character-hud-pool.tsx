import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { CharacterHud } from './character-hud';

const useStyles = makeStyles(() => ({
    root: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none'
    },
    hudWrapper: {
        position: 'absolute',
        left: 0,
        top: 0
    }
}));

export const CharacterHudPool: React.FC = () => {
    const classes = useStyles();

    const characterList = useBattleSelector(battle => battle.characterList);

    return <div className={classes.root}>
        {characterList.map(characterId => {

            return <div
                    key={characterId}
                    className={classes.hudWrapper}>
                    <CharacterHud
                        characterId={characterId}
                    />
                </div>;
        })}
    </div>;
};
