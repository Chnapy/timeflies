import Box from '@material-ui/core/Box';
import CardActionArea from '@material-ui/core/CardActionArea';
import { assertIsDefined, CharacterRoom, TeamRoom, Position, equals, CharacterType } from '@timeflies/shared';
import React from 'react';
import { useGameCurrentPlayer } from '../../../hooks/useGameCurrentPlayer';
import { useGameStep } from '../../../hooks/useGameStep';
import { TeamIndicator } from './team-indicator';
import { RemoveBtn } from './remove-btn';
import AddIcon from '@material-ui/icons/Add';
import { Avatar, Menu, MenuItem } from '@material-ui/core';

export interface MapBoardTilePlacementProps {
    position: Position;
    teamId: TeamRoom[ 'id' ];
}

const getCharacter = (team: TeamRoom, position: Position) => {

    const player = team.players.find(p => p.characters.some(c => equals(c.position)(position)));
    if (!player) {
        return;
    }

    const character = player.characters.find(c => equals(c.position)(position));
    assertIsDefined(character);

    return character;
};

export const MapBoardTilePlacement: React.FC<MapBoardTilePlacementProps> = ({ teamId, position }) => {

    const currentPlayerId = useGameCurrentPlayer(p => p.id);

    const team = useGameStep('room', room => room.teamsTree.teams.find(t => t.id === teamId));
    assertIsDefined(team);

    const isTileAllowed = team.players.some(p => p.id === currentPlayerId);

    const character = getCharacter(team, position);

    const tileProps: TilePlacementProps = {
        team,
        character,
        isAllowed: isTileAllowed
    };

    return <TilePlacement {...tileProps} />;
};

interface TilePlacementProps {
    team: TeamRoom;
    character: CharacterRoom | undefined;
    isAllowed: boolean;
}

const TilePlacement: React.FC<TilePlacementProps> = ({ team, character, isAllowed }) => {
    const [ anchorEl, setAnchorEl ] = React.useState(null);

    const handleMainClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (characterType: CharacterType): void => {
        handleClose();

    };

    const mainRender = character
        ? <Avatar variant='square' />
        : (
            isAllowed
                ? <AddIcon fontSize='large' />
                : null
        );

    return <Box
        position='relative'
        flexGrow={1}
        display='flex'
        color='#444'
        bgcolor={isAllowed ? '#FFF' : '#F8F8F8'}
        border='2px solid #444'
    >
        <CardActionArea disabled={!isAllowed} onClick={handleMainClick} style={{
            flexGrow: 1,
            display: 'flex',
        }}>
            {mainRender}
        </CardActionArea>

        <Box position='absolute' left={0} top={0} style={{
            transform: 'translate(-50%, -50%)'
        }}>
            <TeamIndicator teamLetter={team.letter} />
        </Box>

        {isAllowed && character && (
            <Box position='absolute' right={0} top={0} style={{
                transform: 'translate(50%, -50%)'
            }}>
                <RemoveBtn onClick={() => { }} />
            </Box>
        )}

        <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
                horizontal: 'right',
                vertical: 'top'
            }}
        >
            {new Array<CharacterType>('sampleChar1', 'sampleChar2').map(type => (
                <MenuItem key={type} onClick={() => handleMenuItemClick(type)}>
                    <Avatar variant='square' />
                    {type}
                </MenuItem>
            ))}
        </Menu>
    </Box>;
};
