import { ButtonBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Remove from '@material-ui/icons/Remove';
import React from 'react';

export interface RemoveBtnProps {
    onClick: () => void;
}

const useStyles = makeStyles(() => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '1rem',
        height: '1rem',
        padding: '0.625rem',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: '#444',
        borderRadius: 4,
        color: '#444',
        backgroundColor: '#FFF',
    }
}));

export const RemoveBtn: React.FC<RemoveBtnProps> = ({ onClick }) => {

    const classes = useStyles();

    return <ButtonBase component='div' className={classes.root} onClick={onClick}>
        <Remove />
    </ButtonBase>;
};
