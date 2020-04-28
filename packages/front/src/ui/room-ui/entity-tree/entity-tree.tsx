import { TreeView } from '@material-ui/lab';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { EntityTreeTeam } from './entity-tree-team';
import { Box } from '@material-ui/core';

export const EntityTree: React.FC = () => {

    const teamList = useGameStep('room', room => room.teamsTree.teamList);

    // This is definitely a hack to ensure the TreeView to be always expanded 
    // no matter the children items
    const expandedHack: Array<string> = Object.assign<Array<string>, any>([], {
        indexOf: () => true
    });

    return (
        <TreeView disableSelection expanded={expandedHack}>
            {teamList.map(t => (
                <Box key={t.id} mb={2}>
                    <EntityTreeTeam team={t} />
                </Box>
            ))}
        </TreeView>
    );
};
