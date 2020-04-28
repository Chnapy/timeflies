import React from 'react';
import { MapBoard } from './map-board/map-board';
import { EntityTree } from './entity-tree/entity-tree';
import { MapSelector } from './map-selector/map-selector';
import { Box } from '@material-ui/core';


export const UIRoom: React.FC = () => {

    return (
        <Box display='flex' m={2}>

            <Box display='flex' flexDirection='column' width={400} flexShrink={0}>

                <MapSelector />

                <Box mt={2}>
                    <EntityTree />
                </Box>
            </Box>

            <Box ml={2}>
                <MapBoard />

            </Box>


        </Box>
    );
};
