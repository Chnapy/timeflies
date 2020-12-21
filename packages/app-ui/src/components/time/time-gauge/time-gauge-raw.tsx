import { Box, makeStyles } from '@material-ui/core';
import { ArrayUtils } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';
import { TimePartialProps } from '../time-props';


const tockSpacing = 2;
const tockMaxWidth = 12;

const tickSpacing = 1;
const tickMaxWidth = Math.floor(tockMaxWidth * (3 / 5));

const useStyles = makeStyles(({ palette }) => ({
    tock: {
        height: '100%',
        width: `calc(25% - ${tockSpacing * (4 / 5)}px)`,
        maxWidth: tockMaxWidth,
        backgroundColor: palette.timeItems.tock
    },
    tockSpace: {
        marginLeft: tockSpacing
    },
    tick: {
        flexGrow: 1,
        height: '100%',
        maxWidth: tickMaxWidth,
        minWidth: 1,
        backgroundColor: palette.timeItems.tick
    },
    tickSpace: {
        marginLeft: tickSpacing
    },
}));

export const TimeGaugeRaw: React.FC<TimePartialProps> = ({ duration }) => {
    const classes = useStyles();

    if(duration > 1000000) {
        throw new Error('Duration too high, probably bad value: ' + duration);
    }

    const seconds = Math.ceil(duration / 1000);

    const nbrTocks = Math.floor(seconds / 5);
    const nbrTicks = seconds % 5;

    return <Box display='flex' flexWrap='nowrap' height={4} flexGrow={1}>
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
    </Box>
};
