import { Box, makeStyles } from '@material-ui/core';
import { getTimeSimplifiedDurationFn, useCadencedTime } from '@timeflies/app-ui';
import { SpellCategory } from '@timeflies/common';
import React from 'react';

export type SpellDurationGaugeProps = {
    spellCategory: SpellCategory;
    startTime: number;
    duration: number;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ spellCategory }: Pick<SpellDurationGaugeProps, 'spellCategory'>) => ({
        backgroundColor: palette.spellCategories[ spellCategory ],
        height: '100%'
    })
}));

export const SpellDurationGauge: React.FC<SpellDurationGaugeProps> = ({
    spellCategory, startTime, duration
}) => {
    const classes = useStyles({ spellCategory });

    const timeSimplifiedDurationFn = React.useMemo(
        () => getTimeSimplifiedDurationFn({ startTime, duration }, 2),
        [ startTime, duration ]
    );

    const remainingTime = useCadencedTime(timeSimplifiedDurationFn);

    const width = `${remainingTime / duration * 100}%`;

    const opacity = remainingTime < duration && remainingTime > 0
        ? 1
        : 0.25;

    return <Box className={classes.root} style={{ 
        width,
        opacity
    }} />;
};
