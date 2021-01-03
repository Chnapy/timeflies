import { makeStyles } from '@material-ui/core';
import { TimeFullProps } from '@timeflies/app-ui';
import React from 'react';
import { SpellDurationGauge, SpellDurationGaugeProps } from './spell-duration-gauge';

export type SpellGaugeListProps = TimeFullProps & {
    spellDurationList: SpellDurationGaugeProps[];
};

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        position: 'relative',
        height: 6,
        padding: spacing(0.25),
        flexGrow: 1
    },
    gauge: {
        backgroundColor: palette.background.default,
        position: 'absolute',
        top: 0,
        bottom: 0,
        padding: 1,
        minWidth: 3
    }
}));

export const SpellGaugeList: React.FC<SpellGaugeListProps> = ({ startTime, duration, spellDurationList }) => {
    const classes = useStyles();

    const content = spellDurationList.map(props => {
        const right = `${((props.startTime - startTime) / duration) * 100}%`;
        const width = `${(props.duration / duration) * 100}%`;

        return <div key={props.startTime} className={classes.gauge} style={{ right, width }}>
            <SpellDurationGauge {...props} />
        </div>;
    });

    return (
        <div className={classes.root}>
            {content}
        </div>
    );
};
