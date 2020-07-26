import { ButtonProps, PropTypes, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import clsx from 'clsx';

export type UIButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
    variant?: Extract<PropTypes.Color, 'primary' | 'secondary'>;
};

const useStyles = makeStyles(() => ({
    root: {
        borderWidth: '2px !important'
    }
}));

export const UIButton = React.forwardRef<HTMLButtonElement, UIButtonProps>(({
    variant = 'secondary',
    ...rest
}, ref) => {
    const classes = useStyles();

    const btnVariant = variant === 'primary'
        ? 'contained'
        : 'outlined';

    return <Button ref={ref} variant={btnVariant} color={variant} {...rest} className={clsx(classes.root, rest.className)} />;
});
