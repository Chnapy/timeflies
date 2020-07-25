import { ButtonProps, PropTypes, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import clsx from 'clsx';

export type UIButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
    variant?: Extract<PropTypes.Color, 'primary' | 'secondary'>;
};

const useStyles = makeStyles(({}) => ({
    root: {
        '&, &:hover': {
            borderWidth: 2
        }
    },
    secondary: {
    },
    primary: {
    }
}));

export const UIButton: React.FC<UIButtonProps> = ({
    variant = 'secondary',
    ...rest
}) => {
    const classes = useStyles();

    const btnVariant = variant === 'primary'
        ? 'contained'
        : 'outlined';

    return <Button className={clsx(classes.root, classes[variant])} variant={btnVariant} color={variant} {...rest} />;
};
