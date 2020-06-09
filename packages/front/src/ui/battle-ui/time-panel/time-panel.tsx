import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { TimeGauge } from './time-gauge/time-gauge';
import { UIIcon } from '../spell-panel/spell-button/ui-icon';
import { UIText, formatMsToSeconds } from '../spell-panel/spell-button/ui-text';
import { useGameStep } from '../../hooks/useGameStep';
import { shallowEqual } from 'react-redux';

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

const getRemainingTime = (turnStartTime: number, turnDuration: number) => Math.max(turnStartTime + turnDuration - Date.now(), 0);

export const TimePanel: React.FC = () => {
    const classes = useStyles();

    const { turnStartTime, turnDuration } = useGameStep('battle',
        ({ cycleState }) => ({
            turnStartTime: cycleState.turnStartTime,
            turnDuration: cycleState.turnDuration,
        }),
        shallowEqual);

    const remainingTimeSpan = React.useRef<HTMLSpanElement>(null);

    const initialRemainingTime = getRemainingTime(turnStartTime, turnDuration);

    React.useEffect(() => {

        const updateRemainingTime = () => {
            if (!remainingTimeSpan.current) {
                return;
            }

            const remainingTime = getRemainingTime(turnStartTime, turnDuration);

            remainingTimeSpan.current.innerHTML = formatMsToSeconds(remainingTime);

            if (remainingTime) {
                requestAnimationFrame(updateRemainingTime);
            }
        };

        requestAnimationFrame(updateRemainingTime);

    }, [ turnDuration, turnStartTime ]);

    return <Paper className={classes.root} elevation={3}>

        <UIIcon icon='time' />

        <Box width='2.7rem' textAlign='right' mx={0.5}>
            <UIText variant='numeric'>
                <span ref={remainingTimeSpan}>{formatMsToSeconds(initialRemainingTime)}</span>
                s
                </UIText>
        </Box>

        <TimeGauge />

    </Paper>;
};
