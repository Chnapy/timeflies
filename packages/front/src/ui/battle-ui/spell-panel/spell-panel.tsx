import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { assertIsDefined } from '@timeflies/shared';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { SpellButton } from './spell-button/spell-button';

const useStyles = makeStyles(() => ({
    root: {
        display: 'inline-flex'
    }
}));

export const SpellPanel: React.FC = () => {

    const classes = useStyles();

    const { spellIdList } = useGameStep('battle',
        ({ cycle }) => {

            if (!cycle.globalTurn) {
                return {
                    characterId: null,
                    spellIdList: [] as string[]
                };
            }

            assertIsDefined(cycle.globalTurn);
            const { character } = cycle.globalTurn.currentTurn;

            return {
                characterId: character.id,
                spellIdList: character.spells.map(s => s.id)
            };
        },
        (a, b) => a.characterId === b.characterId
    );

    return <Paper className={classes.root} elevation={3}>
        <Box display='flex' flexWrap='nowrap' px={1} py={1}>

            {spellIdList.map((spellId, i) => <Box key={spellId} ml={i && 1}>
                <SpellButton spellId={spellId} />
            </Box>)}

        </Box>
    </Paper>;
};
