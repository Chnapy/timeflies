import { GridList, GridListTile } from '@material-ui/core';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomTeam } from './room-team';


export const RoomTeamList: React.FC = React.memo(() => {
    const teamColorList = useRoomSelector(state => state.teamColorList);

    return (
        <GridList cellHeight='auto' cols={2} spacing={8}>
            {teamColorList.map(teamColor => <GridListTile key={teamColor}>
                <RoomTeam teamColor={teamColor} />
            </GridListTile>)}
        </GridList>
    );
});
