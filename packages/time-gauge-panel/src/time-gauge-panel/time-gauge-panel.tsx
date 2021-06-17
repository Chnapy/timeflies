import { Grid, makeStyles } from '@material-ui/core';
import { VariableIcon } from '@timeflies/app-ui';
import React from 'react';
import { SpellGaugeList, SpellGaugeListProps } from '../spell-gauge/spell-gauge-list';
import { TimeCounter } from '../time-counter/time-counter';
import { TimeGaugeBig } from '../time-gauge/time-gauge-big';

export type TimeGaugePanelProps = SpellGaugeListProps;

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        pointerEvents: 'none'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        opacity: 0.5,
        backgroundColor: palette.background.paper,
        zIndex: -1
    },
    gaugesWrapper: {
        pointerEvents: 'all',
        position: 'relative',
        padding: spacing(1),
        backdropFilter: 'blur(2px)'
    },
    counterWrapper: {
        pointerEvents: 'all',
        position: 'relative',
        minWidth: 56,
        padding: spacing(1, 1.5),
        textAlign: 'center',
        backdropFilter: 'blur(2px)'
    },
    timeGaugeWrapper: {
        backgroundColor: palette.background.default,
        padding: spacing(0.25)
    }
}));

export const TimeGaugePanel: React.FC<TimeGaugePanelProps> = ({
    startTime, duration, spellDurationList
}) => {
    const classes = useStyles();
    const timeProps = { startTime, duration };

    const renderGauges = () => (
        <Grid item container direction='column' xs>
            <Grid item>
                <div className={classes.timeGaugeWrapper}>
                    <TimeGaugeBig {...timeProps} />
                </div>
            </Grid>
            <Grid item>
                <SpellGaugeList {...timeProps} spellDurationList={spellDurationList} />
            </Grid>
        </Grid>
    );

    const background = (
        <div className={classes.background} />
    );

    return <Grid className={classes.root} container direction='column' alignItems='stretch'>
        <Grid item xs={12}>
            <div className={classes.gaugesWrapper}>
                {background}
                <Grid container wrap='nowrap' spacing={1}>
                    <Grid item>
                        <VariableIcon variableName='actionTime' />
                    </Grid>
                    {renderGauges()}
                </Grid>
            </div>
        </Grid>
        <Grid item style={{ alignSelf: 'center' }}>
            <div className={classes.counterWrapper}>
                {background}
                <TimeCounter {...timeProps} colored />
            </div>
        </Grid>
    </Grid>;
};
