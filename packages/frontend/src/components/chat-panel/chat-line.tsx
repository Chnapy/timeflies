import { makeStyles } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';

export type ChatLineProps = {
    time: number;
    playerName: string;
    message: string;
};

const useStyles = makeStyles(() => ({
    root: {
        overflowWrap: 'anywhere'
    }
}));

export const ChatLine: React.FC<ChatLineProps> = React.memo(({ playerName, message }) => {
    const classes = useStyles();

    return <UIText className={classes.root} variant='body2'>
        <b>{playerName}:</b> {message}
    </UIText>;
});
