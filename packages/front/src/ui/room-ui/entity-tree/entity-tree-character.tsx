import { CharacterRoom } from '@timeflies/shared';
import React from 'react';
import { TreeItem } from '@material-ui/lab';
import Box from '@material-ui/core/Box';
import { CharacterImage } from '../../battle-ui/character-list-panel/character-item/character-image';
import { UIText } from '../../battle-ui/spell-panel/spell-button/ui-text';

export interface EntityTreeCharacterProps {
    character: CharacterRoom;
}

export const EntityTreeCharacter: React.FC<EntityTreeCharacterProps> = ({ character }) => {

    return (
        <TreeItem nodeId={character.id} label={
            <Box display='flex' alignItems='center' mb={1}>

                <Box clone maxWidth={32} maxHeight={32} flexShrink={0}>
                    <CharacterImage characterRole={character.type} size={32} />
                </Box>

                <Box flexGrow={1} ml={1}>
                    <UIText variant='second'>{character.type}</UIText>
                </Box>

            </Box>
        } />
    );
};
