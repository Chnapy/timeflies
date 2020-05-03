import { TreeItem } from '@material-ui/lab';
import { TeamRoom } from '@timeflies/shared';
import React from 'react';
import { EntityTreePlayer } from './entity-tree-player';
import { TeamIndicator } from '../map-board/map-board-tile/team-indicator';
import { Box } from '@material-ui/core';


export interface EntityTreeTeamProps {
    team: TeamRoom;
}

export const EntityTreeTeam: React.FC<EntityTreeTeamProps> = ({ team }) => {
    const { letter, playersIds } = team;

    return (
        <TreeItem nodeId={team.id} label={<Box display='flex' alignItems='flex-end' mb={1}>
            <Box display='inline-flex' mr={0.5}>Team</Box>
            <TeamIndicator teamLetter={letter} />
        </Box>}>

            {playersIds.map(id => (
                <EntityTreePlayer key={id} playerId={id} />
            ))}
        </TreeItem>
    )
};
