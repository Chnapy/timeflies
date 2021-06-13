import { makeStyles, Paper } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { routes } from '../routes';
import { ButtonLink } from './button-link';

type NotFoundPanelProps = {
    title: string;
    reasons: string[];
};

const useStyles = makeStyles(({ spacing }) => ({
    wrongIdPanel: {
        padding: spacing(2),
        margin: 'auto'
    }
}));

export const NotFoundPanel: React.FC<NotFoundPanelProps> = ({ title, reasons }) => {
    const classes = useStyles();

    return (
        <Paper className={classes.wrongIdPanel}>
            <UIText variant='body1'>{title}</UIText>

            <UIText variant='body2' component='div'>
                Some possible reasons:
            <ul>
                    {reasons.map(reason => <li key={reason}>{reason}</li>)}
                </ul>
            </UIText>

            <ButtonLink to={routes.roomListPage().path} fullWidth>
                back to room list
            </ButtonLink>
        </Paper>
    );
};
