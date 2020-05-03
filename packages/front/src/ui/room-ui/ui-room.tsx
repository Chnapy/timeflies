import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { EntityTree } from './entity-tree/entity-tree';
import { MapBoard } from './map-board/map-board';
import { MapSelector } from './map-selector/map-selector';


const useStyles = makeStyles(({palette, spacing}) => ({
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

            <Box display='flex' flexDirection='column' width={400} flexShrink={0}>

                <MapSelector />

                <Box mt={2}>
                    <EntityTree />
                </Box>
            </Box>

            <Box overflow='auto' ml={2}>
                <MapBoard />

            </Box>


        </div>
    );
};
