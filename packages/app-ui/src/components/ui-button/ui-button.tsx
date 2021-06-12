import { Backdrop, Button, ButtonProps, fade, makeStyles, PropTypes } from '@material-ui/core';
import CircularProgress from "@material-ui/core/CircularProgress";
import clsx from 'clsx';
import React from 'react';
import { UIText } from '../ui-text/ui-text';

export type UIButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
    variant?: Extract<PropTypes.Color, 'primary' | 'secondary'>;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        position: 'relative',
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
    },
    backdrop: {
        position: 'absolute',
        zIndex: 'initial'
    }
}));

export const UIButton: React.FC<UIButtonProps> = ({ variant = 'secondary', className, onClick, disabled, children, ...rest }) => {
    const classes = useStyles();
    const [ loading, setLoading ] = React.useState(false);

    const onClickWrapper: typeof onClick = (...args) => {
        if (!onClick) {
            return;
        }

        const result: unknown = onClick(...args);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    };

    return (
        <Button
            className={clsx(classes.root, className)}
            classes={{ containedSecondary: classes.btnSecondary }}
            variant='contained'
            color={variant}
            size='large'
            onClick={onClickWrapper}
            disabled={disabled || loading}
            {...rest}
        >
            <UIText className={classes.text} variant='body1' component='div'>
                {children}

                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress size='1em' color='inherit' />
                </Backdrop>
            </UIText>
        </Button>
    );
};
