import { Grid } from '@material-ui/core';
import { PlayerId } from '@timeflies/common';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomCharacterList } from '../room-character-list/room-character-list';
import { RoomTeam } from './room-team';


export const RoomTeamList: React.FC = React.memo(() => {
    const teamColorList = useRoomSelector(state => state.teamColorList);
    const [ characterListPlayerId, setCharacterListPlayerId ] = React.useState<PlayerId | null>(null);

    const onCharacterListClose = () => setCharacterListPlayerId(null);
    const onCharacterListOpen = (playerId: PlayerId) => setCharacterListPlayerId(playerId);

    return (
        <>
            <Grid container spacing={1}>
                {teamColorList.map(teamColor => <Grid key={teamColor} item xs>
                    <RoomTeam teamColor={teamColor} onCharacterListOpen={onCharacterListOpen} />
                </Grid>)}
            </Grid>

            <RoomCharacterList playerId={characterListPlayerId} onClose={onCharacterListClose} />
        </>
    );
});
