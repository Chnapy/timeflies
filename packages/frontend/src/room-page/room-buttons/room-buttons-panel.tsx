import { makeStyles, Step, StepButton, Stepper } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import { switchUtil } from '@timeflies/common';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomMapPlacementButton } from '../room-map-placement/room-map-placement-button';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
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
            component: UIButton
        }
    ];

const noIndex = -1;
const placeCharacterIndex = 0;
const playerReadyIndex = 1;

export const RoomButtonsPanel: React.FC = () => {
    const classes = useStyles();
    const playerId = useMyPlayerId();
    const placedCharactersStatus = useRoomSelector(state => {
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

    const getCurrentStep = () => {
        return switchUtil(placedCharactersStatus, {
            "no-characters": noIndex,
            "not-placed": placeCharacterIndex,
            "all-placed": playerReadyIndex
        });
    };

    const getLastCompletedStep = () => {
        if (playerReady) {
            return playerReadyIndex;
        }
        if (placedCharactersStatus === 'all-placed') {
            return placeCharacterIndex;
        }
        return noIndex;
    };

    const currentStep = getCurrentStep();
    const lastCompleteStep = getLastCompletedStep();

    return (
        <Stepper className={classes.root} activeStep={currentStep}>

            {stepList.map(({ type, component: Component }, i) => {

                const completed = i <= lastCompleteStep;

                const icon = completed
                    ? <CheckBoxIcon />
                    : <CheckBoxOutlineBlankIcon />;

                const iconButtonDisabled = i < lastCompleteStep || i > currentStep;

                return (
                    <Step key={type}>
                        {currentStep === i
                            ? (
                                <Component startIcon={icon} />
                            )
                            : (
                                <StepButton
                                    className={iconButtonDisabled ? classes.iconButtonDisabled : undefined}
                                    icon={icon}
                                    disabled={iconButtonDisabled}
                                />
                            )}
                    </Step>
                );
            })}

        </Stepper>
    );
};
