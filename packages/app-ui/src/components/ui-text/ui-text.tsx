import { Typography, TypographyProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Variant } from '@material-ui/core/styles/createTypography';
import clsx from 'clsx';
import React from 'react';
import { useWithSound } from '../../audio-engine/hooks/use-sound';

type UITextVariant = Extract<Variant, 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2'>
    | 'numeric';

export type UITextProps = Omit<TypographyProps, 'variant'> & {
    variant: UITextVariant;
    component?: React.ElementType;
};

const useStyles = makeStyles(({ typography }) => ({
    numeric: {
        fontFamily: typography.fontFamilies.numeric,
        fontWeight: 700
    }
}));

export const UIText: React.FC<UITextProps> = React.forwardRef(({ variant, onClick, ...propsRest }, ref) => {
    const classes = useStyles();
    const withSound = useWithSound('buttonClick');

    const rest = {
        ...propsRest,
        onClick: withSound(onClick),
        ref
    };

    if (variant === 'numeric') {
        return <Typography {...rest} className={clsx(classes.numeric, rest.className)} variant='body2' />;
    }

    return <Typography variant={variant} {...rest} />;
});
