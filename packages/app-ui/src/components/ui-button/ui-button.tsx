import { Button, ButtonProps, fade, makeStyles, PropTypes } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { UIText } from '../ui-text/ui-text';

export type UIButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
    variant?: Extract<PropTypes.Color, 'primary' | 'secondary'>;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        textTransform: 'none'
    },
    text: {
        fontWeight: 600
    },
    btnSecondary: {
        color: palette.common.white,
        backgroundColor: palette.background.level1,

        '&:hover': {
            backgroundColor: fade(palette.background.level1, 0.75),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: palette.background.level1,
            },
        },
    }
}));

export const UIButton: React.FC<UIButtonProps> = ({ variant = 'secondary', className, children, ...rest }) => {
    const classes = useStyles();

    return (
        <Button
            className={clsx(classes.root, className)}
            classes={{ containedSecondary: classes.btnSecondary }}
            variant='contained'
            color={variant}
            size='large'
            {...rest}
        >
            <UIText className={classes.text} variant='body1'>{children}</UIText>
        </Button>
    );
};
