import { useTheme, Theme, makeStyles } from '@material-ui/core/styles';
import { Paper, Box } from '@material-ui/core';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { CharacterItem } from './character-item/character-item';

const useStyles = makeStyles(() => ({
    root: {
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
    }
}));

export const CharacterListPanel: React.FC = () => {

    const classes = useStyles();

    const { palette } = useTheme<Theme>();

    const [ current, ...charactersIds ] = useGameStep('battle', ({ current, cycle }) =>
        current.characters
            .map(c => c.id)
            .sort((a, b) => cycle.globalTurn?.currentTurn.character.id === a ? -1 : 1));

    return <Paper className={classes.root} elevation={3}>

        <Box display='flex' flexDirection='column' overflow='auto'>
            {charactersIds.map((id, i) => <Box key={id} position='relative' p={1}>
                <VerticalLine top={i > 0} bottom color={palette.primary.main} />
                <CharacterItem characterId={id} />
            </Box>)}
        </Box>

        <Box position='relative' bgcolor={palette.primary.main} p={1}>
            <VerticalLine top color={palette.primary.contrastText} />
            <CharacterItem characterId={current} />
        </Box>
    </Paper>
};

const lineWidth = 2;

const VerticalLine: React.FC<{
    top?: boolean;
    bottom?: boolean;
    color: string;
}> = ({ top, bottom, color }) => {

    const left = 12 - lineWidth / 2;

    return (
        <>
            {top && <Box position='absolute' ml={1} left={left} top={0} width={lineWidth} height='60%' bgcolor={color} />}
            {bottom && <Box position='absolute' ml={1} left={left} bottom={0} width={lineWidth} height='40%' bgcolor={color} />}
        </>
    );
};
