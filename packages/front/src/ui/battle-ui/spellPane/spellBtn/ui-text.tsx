import { Typography, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import clsx from 'clsx';

type UITextVariant = 'numeric';

export type UITextProps = {
    variant: UITextVariant;
};

export const formatMsToSeconds = (ms: number): string => {
    if (ms === 0) {
        return '0';
    }
    const value = Number.parseInt(ms / 100 + '') / 10 + '';
    return value.includes('.')
        ? value
        : value + '.0';
};

const useStyles = makeStyles<Theme, 'root' | UITextVariant>(() => ({
    root: {

    },
    numeric: {
        fontWeight: 600
    }
}));

export const UIText: React.FC<UITextProps> = ({ variant, children }) => {
    const classes = useStyles();

    return (
        <Typography className={clsx(classes.root, classes[ variant ])} variant='body2' >
            {children}
        </Typography>
    );
};
