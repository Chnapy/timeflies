import { Box, Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { shallowEqual } from 'react-redux';
import { useGameStep } from '../../hooks/useGameStep';
import { UITypography } from '../../ui-components/typography/ui-typography';
import { UIIcon } from '../spell-panel/spell-button/ui-icon';
import { formatMsToSeconds } from '../spell-panel/spell-button/ui-text';
import { TimeGauge } from './time-gauge/time-gauge';

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        pointerEvents: 'all',
        display: 'flex',
        flexGrow: 1,
        flexWrap: 'nowrap',
        alignItems: 'center',
        color: palette.primary.main,
        paddingTop: spacing(0.5),
        paddingBottom: spacing(0.5),
        paddingLeft: spacing(2),
        paddingRight: spacing(2)
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

    return <Card className={classes.root}>

        <UITypography variant='body1'>
            <UIIcon icon='time' />
        </UITypography>

        <Box minWidth='3rem' textAlign='right' mx={0.5}>
            <UITypography variant='numeric'>
                <span ref={remainingTimeSpan}>{formatMsToSeconds(initialRemainingTime)}</span>
                s
                </UITypography>
        </Box>

        <TimeGauge />

    </Card>;
};
