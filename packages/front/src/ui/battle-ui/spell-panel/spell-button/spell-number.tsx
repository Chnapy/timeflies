import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { UITypography } from '../../../ui-components/typography/ui-typography';

export type SpellNumberProps = {
    value: number;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        display: 'inline-block',
        width: 12,
        height: 12,
        color: palette.common.white,
        backgroundColor: palette.background.default
    }
}));

export const SpellNumber: React.FC<SpellNumberProps> = React.memo(({ value }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <UITypography variant='labelMini'>{value}</UITypography>
        </div>
    );
});
