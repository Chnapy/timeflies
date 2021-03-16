import { makeStyles } from '@material-ui/core';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { CharacterHud } from './character-hud';
import { useCharactersPositionsContext } from './characters-positions-context';

const useStyles = makeStyles(() => ({
    root: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none'
    },
    hubWrapper: {
        position: 'absolute',
        left: 0,
        top: 0
    }
}));

export const CharacterHudPool: React.FC = () => {
    const classes = useStyles();

    const characterList = useBattleSelector(battle => battle.characterList);
    const positions = useCharactersPositionsContext();

    return <div className={classes.root}>
        {characterList.map(characterId => {
            const pos = positions[ characterId ];

            return pos
                ? <div
                    key={characterId}
                    className={classes.hubWrapper}
                    style={{ transform: `translate(${pos.x}px,${pos.y}px)` }}>
                    <CharacterHud
                        characterId={characterId}
                    />
                </div>
                : null;
        })}
    </div>;
};

