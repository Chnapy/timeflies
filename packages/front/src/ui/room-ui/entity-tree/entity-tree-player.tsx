import { Box } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import StarIcon from '@material-ui/icons/Star';
import SyncIcon from '@material-ui/icons/Sync';
import { TreeItem } from '@material-ui/lab';
import { PlayerRoom } from '@timeflies/shared';
import React from 'react';
import { EntityTreeCharacter } from './entity-tree-character';

export interface EntityTreePlayerProps {
    player: PlayerRoom;
}

export const EntityTreePlayer: React.FC<EntityTreePlayerProps> = ({ player }) => {
    const { id, name, isAdmin, isReady, isLoading, characters } = player;

    return (
        <TreeItem nodeId={id} label={<Box display='flex' mb={1}>
            {isAdmin && <Box display='inline-flex' mr={1}>
                <StarIcon />
            </Box>}
            {name}
            {isReady && <Box display='inline-flex' ml={1}>
                <CheckIcon />
            </Box>}
            {isLoading && <Box display='inline-flex' ml={1}>
                <SyncIcon />
            </Box>}
        </Box>}>
            {characters.map(c => (
                <EntityTreeCharacter key={c.id} character={c} />
            ))}
        </TreeItem>
    );
};
