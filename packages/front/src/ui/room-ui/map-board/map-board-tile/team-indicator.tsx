import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'bottom',
        width: '1rem',
        height: '1rem',
        padding: '0.715em',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: '#444',
        borderRadius: '100%',
        color: '#444',
        backgroundColor: '#FFF',
        fontWeight: 600
    }
}));

export interface TeamIndicatorProps {
    teamLetter: string;
}

export const TeamIndicator: React.FC<TeamIndicatorProps> = ({ teamLetter }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {teamLetter}
        </div>
    );
};
