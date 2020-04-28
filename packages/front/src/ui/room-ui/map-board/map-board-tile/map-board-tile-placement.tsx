import Box from '@material-ui/core/Box';
import CardActionArea from '@material-ui/core/CardActionArea';
import { assertIsDefined, CharacterRoom, TeamRoom, Position, equals, CharacterType, PlayerRoom } from '@timeflies/shared';
import React from 'react';
import { useGameCurrentPlayer } from '../../../hooks/useGameCurrentPlayer';
import { useGameStep } from '../../../hooks/useGameStep';
import { TeamIndicator } from './team-indicator';
import { RemoveBtn } from './remove-btn';
import AddIcon from '@material-ui/icons/Add';
import { Avatar, Menu, MenuItem } from '@material-ui/core';
import { useGameNetwork } from '../../../hooks/useGameNetwork';

export interface MapBoardTilePlacementProps {
    position: Position;
    teamId: TeamRoom[ 'id' ];
}

const findCharacter = ([ player, ...rest ]: PlayerRoom[], position: Position): CharacterRoom | undefined => {
    return player
        ? (player.characters.find(c => equals(c.position)(position)) ?? findCharacter(rest, position))
        : undefined;
};

export const MapBoardTilePlacement: React.FC<MapBoardTilePlacementProps> = ({ teamId, position }) => {

    const currentPlayerId = useGameCurrentPlayer(p => p.id);

    const { team, isAllowed, character } = useGameStep('room', ({ teamsTree }) => {

        const team = teamsTree.teamList.find(t => t.id === teamId);
        assertIsDefined(team);

        const isAllowed = team.playersIds.some(id => id === currentPlayerId);

        const character = findCharacter(teamsTree.playerList, position);

        return {
            team,
            isAllowed,
            character
        };
    });

    const tileProps: TilePlacementProps = {
        position,
        team,
        character,
        isAllowed
    };

    return <TilePlacement {...tileProps} />;
};

interface TilePlacementProps {
    position: Position;
    team: TeamRoom;
    character: CharacterRoom | undefined;
    isAllowed: boolean;
}

const TilePlacement: React.FC<TilePlacementProps> = ({ position, team, character, isAllowed }) => {
    const [ anchorEl, setAnchorEl ] = React.useState(null);

    const { sendCharacterAdd, sendCharacterRemove } = useGameNetwork({
        sendCharacterAdd: (characterType: CharacterType) => ({
            type: 'room/character/add',
            characterType,
            position
        }),
        sendCharacterRemove: () => ({
            type: 'room/character/remove',
            position
        }),
    });

    const handleMainClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (characterType: CharacterType): void => {
        handleClose();

        sendCharacterAdd(characterType);
    };

    const handleRemove = sendCharacterRemove;

    const mainRender = isAllowed
        ? (character ? <Avatar variant='square' /> : <AddIcon fontSize='large' />)
        : null;

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
                <RemoveBtn onClick={handleRemove} />
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
