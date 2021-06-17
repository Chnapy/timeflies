import { Box, CardActionArea, IconButton, makeStyles, Paper } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

type DetailsPanelTemplateProps = {
    width: number;
    onClick?: () => void;
    onClose?: () => void;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ clickable }: { clickable: boolean }) => ({
        position: 'relative',
        backgroundColor: clickable ? palette.background.level1 : undefined
    }),
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    closeBtn: {
        position: 'absolute',
        top: 0,
        right: 0
    }
}));

export const DetailsPanelTemplate: React.FC<DetailsPanelTemplateProps> = ({ width, onClick, onClose, children }) => {
    const classes = useStyles({ clickable: !!onClick });

    return <Paper className={classes.root}>
        {onClick && <CardActionArea className={classes.wrapper} onClick={onClick} />}
        <Box minWidth={width} p={2}>
            {children}

            {onClose && (
                <IconButton className={classes.closeBtn} size='small' onClick={onClose}>
                    <CloseIcon fontSize='inherit' />
                </IconButton>
            )}
        </Box>
    </Paper>;
};
