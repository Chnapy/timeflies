import { Box, Dialog } from "@material-ui/core";
import React from "react";
import { shallowEqual } from "react-redux";
import { useGameStep } from "../../hooks/useGameStep";
import { TeamIndicator } from "../../room-ui/map-board/map-board-tile/team-indicator";
import { UITypography } from "../../ui-components/typography/ui-typography";

export const BattleResults: React.FC = () => {

    const { battleEnded, winnerTeamId } = useGameStep('battle', ({ battleResults }) => battleResults);

    const winner = useGameStep(
        'battle',
        ({ snapshotState }) => {
            if (!battleEnded) {
                return;
            }

            const team = snapshotState.teamList[winnerTeamId];
            const isMyTeam = snapshotState.playerList[snapshotState.myPlayerId].teamId === team.id;

            return {
                team,
                isMyTeam
            };
        },
        shallowEqual
    );

    if (!winner) {
        return null;
    }

    return <Dialog open>
        <Box display='flex' flexDirection='column' justifyContent='space-between' height={300} py={3} px={4} textAlign='center'>

            <UITypography variant='h3' gutterBottom>
                Battle is over
        </UITypography>

            <Box>
                <UITypography variant='h4' gutterBottom>
                    Winner team is
        </UITypography>

                <TeamIndicator teamLetter={winner.team.letter} />
            </Box>

            <UITypography variant='body1' gutterBottom>
                {winner.isMyTeam
                    ? 'You won !'
                    : 'You lost...'
                }
            </UITypography>

        </Box>
    </Dialog>;
};
