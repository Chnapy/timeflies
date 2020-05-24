import { ButtonBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Remove from '@material-ui/icons/Remove';
import React from 'react';

export interface RemoveBtnProps {
    onClick: () => void;
}

const useStyles = makeStyles(({palette, shape}) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '2rem',
        height: '2rem',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: shape.borderRadius,
        backgroundColor: palette.primary.contrastText,
    }
}));

export const RemoveBtn: React.FC<RemoveBtnProps> = ({ onClick }) => {

    const classes = useStyles();

    return <ButtonBase component='div' className={classes.root} onClick={onClick}>
        <Remove />
    </ButtonBase>;
};
