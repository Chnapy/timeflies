import { Box, Dialog, Grid, makeStyles } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { ButtonLink } from '../../../components/button-link';
import { useMyPlayerId } from '../../../login-page/hooks/use-my-player-id';
import { routes } from '../../../routes';
import { useIsSpectator } from '../../hooks/use-is-spectator';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattleEndCharacterItem } from './battle-end-character-item';
import { useBattleEndContext } from './battle-end-context';

const useStyles = makeStyles(({ palette, spacing }) => ({
    characterList: {
        padding: spacing(1),
        paddingLeft: spacing(2),
        paddingRight: spacing(2),
        marginBottom: spacing(2),
        backgroundColor: palette.background.level1,
        pointerEvents: 'none'
    }
}));

export const BattleEndPanel: React.FC = () => {
    const classes = useStyles();
    const battleEndContext = useBattleEndContext();
    const open = battleEndContext !== null;
    const winnerTeamColor = battleEndContext?.winnerTeamColor;
    const myPlayerId = useMyPlayerId();
    const won = useBattleSelector(state => state.staticPlayers[ myPlayerId ].teamColor === winnerTeamColor);
    const isSpectator = useIsSpectator();

    const roomId = useBattleSelector(state => state.roomId);
    const characterList = useBattleSelector(state => state.characterList);
    const staticPlayers = useBattleSelector(state => state.staticPlayers);
    const staticCharacters = useBattleSelector(state => state.staticCharacters);

    const winners = characterList
        .filter(characterId => {
            const { playerId } = staticCharacters[ characterId ];
            const { teamColor } = staticPlayers[ playerId ];
            return teamColor === winnerTeamColor;
        });

    const losers = characterList
        .filter(characterId => {
            const { playerId } = staticCharacters[ characterId ];
            const { teamColor } = staticPlayers[ playerId ];
            return teamColor !== winnerTeamColor;
        });

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth='sm'
        >
            <Box p={2}>

                <UIText variant='body1' align='center'>
                    Battle is over !<br />
                    {!isSpectator && (
                        won
                            ? 'You won !'
                            : 'You lost...'
                    )}
                </UIText>

                <UIText variant='body2'>Winners</UIText>
                <Box className={classes.characterList}>
                    <Grid container spacing={2}>
                        {winners.map(characterId => (
                            <Grid key={characterId} item>
                                <BattleEndCharacterItem
                                    characterId={characterId}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <UIText variant='body2'>Losers</UIText>
                <Box className={classes.characterList}>
                    <Grid container spacing={2}>
                        {losers.map(characterId => (
                            <Grid key={characterId} item>
                                <BattleEndCharacterItem
                                    characterId={characterId}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <ButtonLink to={routes.roomPage({ roomId }).path} fullWidth>
                    back to room
            </ButtonLink>
            </Box>
        </Dialog>
    );
};
