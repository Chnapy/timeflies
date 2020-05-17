import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import clsx from 'clsx';

type UITextVariant = 'numeric' | 'username' | 'main' | 'second';

export type UITextProps = {
    variant: UITextVariant;
};

export const formatMsToSeconds = (ms: number): string => {
    if (ms === 0) {
        return '0';
    }

    const [ seconds, decimals = '0' ] = (ms / 1000).toString().split('.');

    return `${seconds}.${decimals[ 0 ]}`;
};

const useStyles = makeStyles<Theme, {}, 'root' | UITextVariant>(() => ({
    root: {

    },
    numeric: {
        fontWeight: 600
    },
    username: {
        fontSize: '1.2rem',
        lineHeight: 1
    },
    main: {
        fontSize: '1.2rem',
        fontWeight: 500,
        textTransform: 'uppercase'
    },
    second: {
        textTransform: 'uppercase'
    }
}));

export const UIText: React.FC<UITextProps> = React.memo(({ variant, children }) => {
    const classes = useStyles({});

    return (
        <Typography className={clsx(classes.root, classes[ variant ])} variant='body2' >
            {children}
        </Typography>
    );
});
