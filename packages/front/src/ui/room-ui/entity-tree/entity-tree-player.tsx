import { Box } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import StarIcon from '@material-ui/icons/Star';
import SyncIcon from '@material-ui/icons/Sync';
import { TreeItem } from '@material-ui/lab';
import { PlayerRoom, assertIsDefined } from '@timeflies/shared';
import React from 'react';
import { EntityTreeCharacter } from './entity-tree-character';
import { useGameStep } from '../../hooks/useGameStep';
import { UIText } from '../../battle-ui/spell-panel/spell-button/ui-text';

export interface EntityTreePlayerProps {
    playerId: PlayerRoom[ 'id' ];
}

export const EntityTreePlayer: React.FC<EntityTreePlayerProps> = ({ playerId }) => {

    const player = useGameStep('room', room =>
        room.teamsTree.playerList.find(p => p.id === playerId)
    );
    assertIsDefined(player);

    const { id, name, isAdmin, isReady, isLoading, characters } = player;

    return (
        <TreeItem nodeId={id} label={<Box display='flex' mb={1}>
            <UIText variant='username'>
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
            </UIText>
        </Box>}>
            {characters.map(c => (
                <EntityTreeCharacter key={c.id} character={c} />
            ))}
        </TreeItem>
    );
};
