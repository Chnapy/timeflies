import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { TimeGauge } from './time-gauge/time-gauge';
import { UIIcon } from '../spell-panel/spell-button/ui-icon';
import { UIText, formatMsToSeconds } from '../spell-panel/spell-button/ui-text';
import { useGameStep } from '../../hooks/useGameStep';
import { getTurnRemainingTime } from '../../../stages/battle/cycle/cycle-reducer';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        pointerEvents: 'all',
        display: 'flex',
        flexGrow: 1,
        flexWrap: 'nowrap',
        alignItems: 'center',
        padding: spacing(1)
    }
}));

export const TimePanel: React.FC = () => {
    const classes = useStyles();

    const getRemainingTime = useGameStep('battle',
        battle => () => getTurnRemainingTime(battle, 'current'),
        () => true);

    const remainingTimeSpan = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {

        const updateRemainingTime = () => {
            if (!remainingTimeSpan.current) {
                return;
            }

            const remainingTime = getRemainingTime();

            remainingTimeSpan.current.innerHTML = formatMsToSeconds(remainingTime);

            if (remainingTime) {
                requestAnimationFrame(updateRemainingTime);
            }
        };

        requestAnimationFrame(updateRemainingTime);

    }, [ getRemainingTime ]);

    return <Paper className={classes.root} elevation={3}>

        <UIIcon icon='time' />

        <Box width='2.7rem' textAlign='right' mx={0.5}>
            <UIText variant='numeric'>
                <span ref={remainingTimeSpan}>{formatMsToSeconds(getRemainingTime())}</span>
                s
                </UIText>
        </Box>

        <TimeGauge />

    </Paper>;
};
