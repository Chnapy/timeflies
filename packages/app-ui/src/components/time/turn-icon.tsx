import { useCadencedTime } from './time-hooks';
import { TimeFullProps } from './time-props';
import { getTimeSimplifiedDurationFn } from './time-utils';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import TimerIcon from '@material-ui/icons/Timer';
import { makeStyles, StyleRules } from '@material-ui/core/styles';
import React from 'react';

const iconTypeMap = {
    current: PlayArrowIcon,
    past: PauseIcon,
    future: TimerIcon
};

type IconType = keyof typeof iconTypeMap;

const useStyles = makeStyles(({ palette }): StyleRules<IconType> => ({
    current: {
        color: palette.variables.actionTime
    },
    past: {},
    future: {}
}));

export const TurnIcon: React.FC<TimeFullProps> = props => {
    const classes = useStyles();

    const getDuration = getTimeSimplifiedDurationFn(props, 0);
    const iconType = useCadencedTime((time): IconType => {
        const duration = getDuration(time);

        if(duration === props.duration) {
            return 'future';
        }
        if(duration === 0) {
            return 'past';
        }
        return 'current';
    });

    const Icon = iconTypeMap[iconType];

    return <Icon className={classes[iconType]} fontSize='inherit'/>;
};
