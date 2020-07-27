import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { appTheme } from '../../../app-theme';

export const teamIndicatorSizeRem = 2.4;

const color = appTheme.palette.background.default;
const backgroundColor = appTheme.palette.common.white;

// This component is used in graphics
// so do not use theme palette here
const useStyles = makeStyles((dont: never) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'bottom',
        width: teamIndicatorSizeRem + 'rem',
        height: teamIndicatorSizeRem + 'rem',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'currentColor',
        color,
        backgroundColor,
        fontSize: '1.4rem',
        fontWeight: 600
    }
}));

export interface TeamIndicatorProps {
    teamLetter: string;
    className?: string;
}

export const TeamIndicator: React.FC<TeamIndicatorProps> = ({ teamLetter, className }) => {
    const classes = useStyles();

    return (
        <div className={clsx(classes.root, className)}>
            {teamLetter}
        </div>
    );
};
