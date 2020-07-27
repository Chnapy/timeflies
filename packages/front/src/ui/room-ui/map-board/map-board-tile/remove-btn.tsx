import { makeStyles } from '@material-ui/core/styles';
import Remove from '@material-ui/icons/Remove';
import React from 'react';
import { UIButton } from '../../../ui-components/button/ui-button';

export interface RemoveBtnProps {
    onClick: () => void;
}

const useStyles = makeStyles(({palette}) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '2rem',
        height: '2rem',
        minWidth: 0,
        padding: 0,
        backgroundColor: palette.background.level1 + ' !important',
    }
}));

export const RemoveBtn: React.FC<RemoveBtnProps> = ({ onClick }) => {

    const classes = useStyles();

    return <UIButton className={classes.root} onClick={onClick}>
        <Remove />
    </UIButton>;
};
