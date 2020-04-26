import { TreeView } from '@material-ui/lab';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { EntityTreeTeam } from './entity-tree-team';
import { Box } from '@material-ui/core';

export const EntityTree: React.FC = () => {

    const teams = useGameStep('room', room => room.teamsTree.teams);

    const allId: string[] = teams.flatMap(t =>
        [ t.id, ...t.players.flatMap(p =>
            [ p.id, ...p.characters.map(c => c.id) ]
        ) ]
    );

    return (
        <TreeView disableSelection expanded={allId}>
            {teams.map(t => (
                <Box key={t.id} mb={2}>
                    <EntityTreeTeam team={t} />
                </Box>
            ))}
        </TreeView>
    );
};
