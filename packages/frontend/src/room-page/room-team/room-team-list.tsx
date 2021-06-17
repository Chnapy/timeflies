import { Grid } from '@material-ui/core';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomCharacterList } from '../room-character-list/room-character-list';
import { RoomTeam } from './room-team';


export const RoomTeamList: React.FC = React.memo(() => {
    const teamColorList = useRoomSelector(state => state.teamColorList);
    const [ characterListOpen, setCharacterListOpen ] = React.useState(false);

    const onCharacterListClose = () => setCharacterListOpen(false);
    const onCharacterListOpen = () => setCharacterListOpen(true);

    return (
        <>
            <Grid container spacing={1}>
                {teamColorList.map(teamColor => <Grid key={teamColor} item xs>
                    <RoomTeam teamColor={teamColor} onCharacterListOpen={onCharacterListOpen} />
                </Grid>)}
            </Grid>

            <RoomCharacterList open={characterListOpen} onClose={onCharacterListClose} />
        </>
    );
});
