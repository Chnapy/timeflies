import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useGameSelector } from '../../store/hooks/use-game-selector';
import { ErrorListItem } from './error-list-item';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        position: 'absolute',
        bottom: 0,
        top: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'stretch',
        width: 250,
        padding: spacing(1),
        pointerEvents: 'none'
    }
}));

export const ErrorList: React.FC = () => {
    const classes = useStyles();
    const errorListMap = useGameSelector(state => state.errorList);

    const errorIdList = Object.values(errorListMap)
        .sort((a, b) => a.time > b.time ? 1 : 0)
        .map(error => error.id);

    return <div className={classes.root}>
        {errorIdList.map(errorId => (
            <ErrorListItem key={errorId} errorId={errorId} />
        ))}
    </div>;
};
