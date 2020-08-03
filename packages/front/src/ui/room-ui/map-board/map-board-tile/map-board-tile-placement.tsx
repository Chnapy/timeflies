import { Menu, MenuItem } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Theme, useTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { assertIsDefined, CharacterRoom, CharacterRole, PlayerRoom, Position, TeamRoom, characterRoleList } from '@timeflies/shared';
import React from 'react';
import { CharacterImage } from '../../../battle-ui/character-list-panel/character-item/character-image';
import { useGameCurrentPlayer } from '../../../hooks/useGameCurrentPlayer';
import { useGameNetwork } from '../../../hooks/useGameNetwork';
import { useGameStep } from '../../../hooks/useGameStep';
import { RemoveBtn } from './remove-btn';
import { TeamIndicator } from './team-indicator';
import { UIButton } from '../../../ui-components/button/ui-button';

export interface MapBoardTilePlacementProps {
    position: Position;
    teamId: TeamRoom[ 'id' ];
}

const findCharacter = ([ player, ...rest ]: PlayerRoom[], position: Position): CharacterRoom | undefined => {
    return player
        ? (player.characters.find(c => c.position.id === position.id) ?? findCharacter(rest, position))
        : undefined;
};

export const MapBoardTilePlacement: React.FC<MapBoardTilePlacementProps> = ({ teamId, position }) => {

    const currentPlayerId = useGameCurrentPlayer(p => p.id);

    const team = useGameStep('room', ({ teamsTree }) => {

        const { teamList } = teamsTree;

        const team = teamList.find(t => t.id === teamId);
        assertIsDefined(team);

        return team;
    });

    const isAllowed = useGameStep('room', ({ teamsTree }) => {

        const { teamList } = teamsTree;

        const team = teamList.find(t => t.id === teamId);
        assertIsDefined(team);

        return team.playersIds.includes(currentPlayerId)
            || !teamList.some(t => t.playersIds.includes(currentPlayerId))
    });

    const character = useGameStep('room', ({ teamsTree }) => {

        const { playerList } = teamsTree;

        return findCharacter(playerList, position);
    });

    const isCharacterMine = useGameStep('room', ({ teamsTree }) => {

        const { playerList } = teamsTree;

        const currentPlayer = playerList.find(p => p.id === currentPlayerId);
        assertIsDefined(currentPlayer);

        return currentPlayer.characters.some(c => c.id === character?.id);
    });

    const isPlayerReady = useGameStep('room', ({ teamsTree }) => {

        const { playerList } = teamsTree;

        const currentPlayer = playerList.find(p => p.id === currentPlayerId);
        assertIsDefined(currentPlayer);

        return currentPlayer.isReady;
    });

    const canAdd = isAllowed && !character && !isPlayerReady;

    const canRemove = isCharacterMine && !isPlayerReady;

    const tileProps: TilePlacementProps = {
        position,
        team,
        character,
        isAllowed,
        canAdd,
        canRemove
    };

    return <TilePlacement {...tileProps} />;
};

interface TilePlacementProps {
    position: Position;
    team: TeamRoom;
    character: CharacterRoom | undefined;
    isAllowed: boolean;
    canAdd: boolean;
    canRemove: boolean;
}

const TilePlacement: React.FC<TilePlacementProps> = ({ position, team, character, isAllowed, canAdd, canRemove }) => {
    const [ anchorEl, setAnchorEl ] = React.useState(null);

    const { sendCharacterAdd, sendCharacterRemove } = useGameNetwork({
        sendCharacterAdd: (characterRole: CharacterRole) => ({
            type: 'room/character/add',
            characterType: characterRole,
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

    const handleMenuItemClick = (characterRole: CharacterRole): void => {
        handleClose();

        sendCharacterAdd(characterRole);
    };

    const handleRemove = sendCharacterRemove;

    const mainRender = isAllowed
        ? (character ? <CharacterImage characterRole={character.type} size={40} /> : <AddIcon fontSize='large' />)
        : null;

    const { palette } = useTheme<Theme>();

    return <Box position='relative' flexGrow={1} display='flex'>
        <UIButton
            disabled={!canAdd}
            onClick={handleMainClick}
            style={{
                position: 'relative',
                flexGrow: 1,
                display: 'flex',
                padding: 5,
                backgroundColor: palette.background.level1
            }}
        >
            {mainRender ?? ' '}
        </UIButton>

        <Box position='absolute' left={0} top={0} style={{
            transform: 'translate(-50%, -50%)'
        }}>
            <TeamIndicator teamLetter={team.letter} />
        </Box>

        {canRemove && (
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
            {characterRoleList.map(type => (
                <MenuItem key={type} onClick={() => handleMenuItemClick(type)}>
                    <CharacterImage characterRole={type} size={40} />
                </MenuItem>
            ))}
        </Menu>
    </Box>;
};
