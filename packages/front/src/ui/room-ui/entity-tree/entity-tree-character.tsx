import Box from '@material-ui/core/Box';
import { TreeItem } from '@material-ui/lab';
import { CharacterRoom } from '@timeflies/shared';
import React from 'react';
import { CharacterImage } from '../../battle-ui/character-list-panel/character-item/character-image';
import { UITypography } from '../../ui-components/typography/ui-typography';

export interface EntityTreeCharacterProps {
    character: CharacterRoom;
}

export const EntityTreeCharacter: React.FC<EntityTreeCharacterProps> = ({ character }) => {

    return (
        <TreeItem nodeId={character.id} label={
            <Box display='flex' alignItems='center' mb={1}>

                <Box clone maxWidth={24} maxHeight={24} flexShrink={0}>
                    <CharacterImage characterRole={character.type} size={24} />
                </Box>

                <Box flexGrow={1} ml={1}>
                    <UITypography variant='labelMini'>{character.type}</UITypography>
                </Box>

            </Box>
        } />
    );
};
