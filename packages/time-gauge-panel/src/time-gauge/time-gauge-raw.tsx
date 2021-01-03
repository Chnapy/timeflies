import { makeStyles } from '@material-ui/core';
import { TimePartialProps } from '@timeflies/app-ui';
import { ArrayUtils } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';

export type TimeGaugeRawStyleProps = {
    height: number;
    tockMaxWidth: number;
    tockSpacing: number;
    tickMaxWidth: number;
    tickSpacing: number;
};

export type TimeGaugeRawProps = TimePartialProps & TimeGaugeRawStyleProps;

const useStyles = makeStyles(({ palette }) => ({
    root: ({ height }: TimeGaugeRawStyleProps) => ({
        display: 'flex',
        flexWrap: 'nowrap',
        height,
        flexGrow: 1
    }),
    tock: ({ tockMaxWidth, tockSpacing }: TimeGaugeRawStyleProps) => ({
        height: '100%',
        width: `calc(25% - ${tockSpacing * (4 / 5)}px)`,
        maxWidth: tockMaxWidth,
        backgroundColor: palette.timeItems.tock
    }),
    tockSpace: ({ tockSpacing }: TimeGaugeRawStyleProps) => ({
        marginLeft: tockSpacing
    }),
    tick: ({ tickMaxWidth }: TimeGaugeRawStyleProps) => ({
        flexGrow: 1,
        height: '100%',
        maxWidth: tickMaxWidth,
        minWidth: 1,
        backgroundColor: palette.timeItems.tick
    }),
    tickSpace: ({ tickSpacing }: TimeGaugeRawStyleProps) => ({
        marginLeft: tickSpacing
    }),
}));

export const TimeGaugeRaw: React.FC<TimeGaugeRawProps> = ({
    duration, height, tockMaxWidth, tockSpacing, tickMaxWidth, tickSpacing
}) => {
    const classes = useStyles({ height, tockMaxWidth, tockSpacing, tickMaxWidth, tickSpacing });

    if (duration > 1000000) {
        throw new Error('Duration too high, probably bad value: ' + duration);
    }

    const seconds = Math.ceil(duration / 1000);

    const nbrTocks = Math.floor(seconds / 5);
    const nbrTicks = seconds % 5;

    return <div className={classes.root}>
        {ArrayUtils.range(nbrTocks)
            .map(i => (
                <div key={i} className={clsx(classes.tock, {
                    [ classes.tockSpace ]: i !== 0
                })} />
            ))}
        {ArrayUtils.range(nbrTicks)
            .map(i => (
                <div key={i} className={clsx(classes.tick, {
                    [ classes.tockSpace ]: i === 0 && nbrTocks > 0,
                    [ classes.tickSpace ]: i !== 0
                })} />
            ))}
    </div>;
};
