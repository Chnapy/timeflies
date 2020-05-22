import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

export const teamIndicatorSizeRem = 2.4; 

const useStyles = makeStyles(({ palette }) => ({
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
        borderRadius: '100%',
        backgroundColor: palette.primary.contrastText,
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
