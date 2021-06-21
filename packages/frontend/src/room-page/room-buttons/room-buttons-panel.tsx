import { Box, Grid, makeStyles, Paper, Step, StepButton, Stepper } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { UIButtonProps, UIText } from '@timeflies/app-ui';
import { switchUtil } from '@timeflies/common';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useIsRoomReady } from '../hooks/use-is-room-ready';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomMapPlacementButton } from '../room-map-placement/room-map-placement-button';
import { RoomReadyButton } from './room-ready-button';

const useStyles = makeStyles(({ spacing }) => ({
    stepper: {
        flexWrap: 'wrap',
        padding: spacing(2)
    },
    iconButtonDisabled: {
        opacity: 0.25
    }
}));

const stepList: {
    type: string;
    component: React.ElementType<Pick<UIButtonProps, 'startIcon'>>;
}[] = [
        {
            type: 'placement',
            component: RoomMapPlacementButton
        },
        {
            type: 'ready',
            component: RoomReadyButton
        }
    ];

const noIndex = -1;
const placeCharacterIndex = 0;
const playerReadyIndex = 1;

export const RoomButtonsPanel: React.FC = () => {
    const classes = useStyles();
    const playerId = useMyPlayerId();
    const placedCharactersStatus = useRoomSelector(state => {

        if (Object.values(state.staticPlayerList).length < 2) {
            return 'no-players';
        }

        const playerCharacterList = Object.values(state.staticCharacterList)
            .filter(character => character.playerId === playerId);

        if (playerCharacterList.length === 0) {
            return 'no-characters';
        }

        if (playerCharacterList.every(character => character.placement !== null)) {
            return 'all-placed';
        }

        return 'not-placed';
    });
    const playerReady = useRoomSelector(state => state.staticPlayerList[ playerId ].ready);
    const roomReady = useIsRoomReady();

    const getCurrentStep = React.useCallback(() => {

        return switchUtil(placedCharactersStatus, {
            "no-players": noIndex,
            "no-characters": noIndex,
            "not-placed": placeCharacterIndex,
            "all-placed": playerReadyIndex
        });
    }, [ placedCharactersStatus ]);

    const [ currentStep, setCurrentStep ] = React.useState<number>(getCurrentStep);

    const getLastCompletedStep = () => {
        if (playerReady) {
            return playerReadyIndex;
        }
        if (placedCharactersStatus === 'all-placed') {
            return placeCharacterIndex;
        }
        return noIndex;
    };

    const lastCompleteStep = getLastCompletedStep();

    React.useEffect(() => {
        setCurrentStep(getCurrentStep);
    }, [ lastCompleteStep, getCurrentStep ]);

    const getOnPreviousStepClick = (step: number) => () => {
        setCurrentStep(step);
    };

    const showStepper = currentStep !== noIndex;

    return (
        <Grid container direction='column' spacing={1}>

            {roomReady && <Grid item>
                <Paper>
                    <Box px={2} py={1}>
                        <UIText variant='body1' align='center'>
                            Battle will start very soon !
                </UIText>
                    </Box>
                </Paper>
            </Grid>}

            {showStepper && <Grid item>
                <Stepper className={classes.stepper} activeStep={currentStep}>

                    {stepList.map(({ type, component: Component }, i) => {

                        const completed = i <= lastCompleteStep;

                        const icon = completed
                            ? <CheckBoxIcon />
                            : <CheckBoxOutlineBlankIcon />;

                        const iconButtonDisabled = i > lastCompleteStep + 1 || i < lastCompleteStep;

                        return (
                            <Step key={type}>
                                {currentStep === i
                                    ? (
                                        <Component startIcon={icon} />
                                    )
                                    : (
                                        <StepButton
                                            className={iconButtonDisabled ? classes.iconButtonDisabled : undefined}
                                            onClick={getOnPreviousStepClick(i)}
                                            icon={icon}
                                            disabled={iconButtonDisabled}
                                        />
                                    )}
                            </Step>
                        );
                    })}

                </Stepper>
            </Grid>}
        </Grid>
    );
};
