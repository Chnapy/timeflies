import { TreeView } from '@material-ui/lab';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { EntityTreeTeam } from './entity-tree-team';
import { Box } from '@material-ui/core';
import { EntityTreePlayer } from './entity-tree-player';

export const EntityTree: React.FC = () => {

    const { teamList, noTeamPlayerList } = useGameStep('room', room => {
        const { teamList, playerList } = room.teamsTree;

        const noTeamPlayerList = playerList.filter(p => !teamList.some(t => t.playersIds.includes(p.id)));

        return {
            teamList,
            noTeamPlayerList
        };
    });

    // This is definitely a hack to ensure the TreeView to be always expanded 
    // no matter the children items
    const expandedHack: Array<string> = Object.assign<Array<string>, any>([], {
        indexOf: () => true
    });

    return (
        <TreeView disableSelection expanded={expandedHack} style={{ pointerEvents: 'none' }}>
            <>
                {noTeamPlayerList.map(p => (
                    <EntityTreePlayer key={p.id} playerId={p.id} />
                ))}
            </>
            {teamList.map(t => (
                <Box key={t.id} mb={2}>
                    <EntityTreeTeam team={t} />
                </Box>
            ))}
        </TreeView>
    );
};
