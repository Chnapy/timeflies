import { Box, Card, CardContent } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import React from 'react';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useGameStep } from '../../hooks/useGameStep';
import { UIButton } from '../../ui-components/button/ui-button';
import { UITypography } from '../../ui-components/typography/ui-typography';
import { useCurrentPlayerRoom } from '../hooks/useCurrentPlayerRoom';

export const ReadyButton: React.FC = () => {

    const { sendReadyState } = useGameNetwork({
        sendReadyState: (isReady: boolean, isLoading: boolean) => ({
            type: 'room/player/state',
            isReady,
            isLoading
        })
    });

    const isReady = useCurrentPlayerRoom(p => p.isReady);
    const isLoading = useCurrentPlayerRoom(p => p.isLoading);
    const charactersEnough = useCurrentPlayerRoom(p => { return p.characters.length > 0 });

    const nbrTeamsEnough = useGameStep('room', ({ teamsTree }) => teamsTree.teamList
        .filter(t => t.playersIds.length > 0).length >= 2
    );

    const launchTime = useGameStep('room', room => room.launchTime);

    const disabled = !charactersEnough || !nbrTeamsEnough;

    const onClick = () => sendReadyState(!isReady, isLoading);

    const timeRef = React.useRef<HTMLSpanElement>(null);

    const getMessage = React.useCallback((): React.ReactNode => {

        if (!charactersEnough) {
            return 'You have to put at least one character on the map';
        }
        if (!nbrTeamsEnough) {
            return 'At least 2 teams should have characters';
        }
        if (!isReady) {
            return 'Indicate to others players you are ready to begin the battle';
        }
        if (isLoading) {
            return 'Waiting for assets loading...';
        }
        if (!launchTime) {
            return 'Waiting others players...'
        }

        return <>
            Everyone is ready!
            <UITypography variant='body1'>Battle start in <span ref={timeRef} />s</UITypography>
        </>;
    }, [ charactersEnough, nbrTeamsEnough, isReady, isLoading, launchTime ]);

    const message: React.ReactNode = getMessage();

    React.useEffect(() => {

        const animationFunction = () => {
            const { current } = timeRef;

            if (!launchTime || !current) {
                return;
            }

            const remains = launchTime - Date.now();

            if (remains <= 0) {
                current.innerHTML = '0';
                return;
            }

            current.innerHTML = Number.parseInt((remains / 1000) + '') + '';

            requestAnimationFrame(animationFunction);
        };

        requestAnimationFrame(animationFunction);

    }, [ launchTime ]);

    return <Card>
        <CardContent>
            <Box display='flex' flexDirection='column'>

                <UITypography variant='body2' gutterBottom>{message}</UITypography>

                <UIButton
                    onClick={onClick}
                    endIcon={isReady ? <CheckIcon /> : null}
                    disabled={disabled}
                >
                    I'm ready
        </UIButton>
            </Box>
        </CardContent>
    </Card>;
};
