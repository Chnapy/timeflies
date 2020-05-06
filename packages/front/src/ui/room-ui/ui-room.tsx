import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { EntityTree } from './entity-tree/entity-tree';
import { MapBoard } from './map-board/map-board';
import { MapSelector } from './map-selector/map-selector';
import { ReadyButton } from './ready-button/ready-button';


const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        display: 'flex',
        height: '100%',
        padding: spacing(2),
        backgroundColor: palette.background.default,
        pointerEvents: 'all'
    }
}));

export const UIRoom: React.FC = () => {

    const classes = useStyles();

    return (
        <div className={classes.root}>

            <Box display='flex' flexDirection='column' minWidth={300} width={400} flexShrink={1}>

                <Box flexShrink={0}>
                    <MapSelector />
                </Box>

                <Box flexGrow={1} overflow='auto' mt={2}>
                    <EntityTree />
                </Box>

                <Box display='flex' flexDirection='column' flexShrink={0} mt={2}>
                    <ReadyButton />
                </Box>
            </Box>

            <Box overflow='auto' ml={2}>
                <MapBoard />

            </Box>


        </div>
    );
};
