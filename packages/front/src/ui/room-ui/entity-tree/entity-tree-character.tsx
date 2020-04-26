import { CharacterRoom } from '@timeflies/shared';
import React from 'react';
import { TreeItem } from '@material-ui/lab';
import { Avatar } from '@material-ui/core';
import Box from '@material-ui/core/Box';

export interface EntityTreeCharacterProps {
    character: CharacterRoom;
}

export const EntityTreeCharacter: React.FC<EntityTreeCharacterProps> = ({ character }) => {

    return (
        <TreeItem nodeId={character.id} label={
            <Box display='flex' alignItems='center' mb={1}>

                <Box clone maxWidth={32} maxHeight={32} flexShrink={0}>
                    <Avatar variant='square' />
                </Box>

                <Box flexGrow={1} fontWeight={600} ml={1}>
                    {character.type}
                </Box>

            </Box>
        } />
    );
};
