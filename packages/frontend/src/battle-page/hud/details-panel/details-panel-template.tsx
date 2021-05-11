import { Box, IconButton, makeStyles, Paper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

type DetailsPanelTemplateProps = {
    width: number;
    onClose: () => void;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: 0,
        right: 0
    }
}));

export const DetailsPanelTemplate: React.FC<DetailsPanelTemplateProps> = ({ width, onClose, children }) => {
    const classes = useStyles();

    return <Paper className={classes.root}>
        <Box minWidth={width} p={2}>
            {children}

            <IconButton className={classes.closeBtn} size='small' onClick={onClose}>
                <CloseIcon fontSize='inherit' />
            </IconButton>
        </Box>
    </Paper>;
};
