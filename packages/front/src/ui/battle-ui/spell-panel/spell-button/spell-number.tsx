import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { UIText } from './ui-text';

export type SpellNumberProps = {
    value: number;
    disabled?: boolean;
};

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: ({ disabled }: Pick<SpellNumberProps, 'disabled'>) => ({
        width: spacing(2),
        height: spacing(2),
        color: palette.primary.contrastText,
        backgroundColor: disabled
            ? palette.action.disabled
            : palette.primary.main
    })
}))

export const SpellNumber: React.FC<SpellNumberProps> = React.memo(({ value, disabled }) => {
    const classes = useStyles({ disabled });

    return (
        <Avatar className={classes.root}>
            <UIText variant='numeric'>
                {value}
            </UIText>
        </Avatar>
    );
});
