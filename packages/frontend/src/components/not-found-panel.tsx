import { makeStyles, Paper } from '@material-ui/core';
import { UIButton, UIText } from '@timeflies/app-ui';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../routes';

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
    const history = useHistory();

    const onBackClick = () => {
        history.push(routes.roomListPage().path);
    };

    return (
        <Paper className={classes.wrongIdPanel}>
            <UIText variant='body1'>{title}</UIText>

            <UIText variant='body2' component='div'>
                Some possible reasons:
            <ul>
                    {reasons.map(reason => <li key={reason}>{reason}</li>)}
                </ul>
            </UIText>

            <UIButton onClick={onBackClick} fullWidth>
                back to room list
            </UIButton>
        </Paper>
    );
};
