import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

type FeedbackContainerProps = {
    left: React.ReactNode;
    right: React.ReactNode;
    bottom?: React.ReactNode;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: 100,
        backgroundColor: palette.background.default
    },
    topContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        height: 20
    },
    bottomContent: {
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        height: 8
    }
}));

export const FeedbackContainer: React.FC<FeedbackContainerProps> = ({
    left, right, bottom
}) => {
    const classes = useStyles();

    return <Box className={classes.root}>
        <Box className={classes.topContent}>
            <Box>
                {left}
            </Box>
            {right}
        </Box>
        {bottom && <Box className={classes.bottomContent}>
            {bottom}
        </Box>}
    </Box>;
};
