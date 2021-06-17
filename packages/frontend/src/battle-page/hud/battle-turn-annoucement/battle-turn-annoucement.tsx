import { makeStyles } from '@material-ui/core';
import { UIText, useCadencedTime } from '@timeflies/app-ui';
import clsx from 'clsx';
import React from 'react';
import { useIsMyCharacterPlaying } from '../../hooks/use-is-my-character-playing';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const useStyles = makeStyles(({ palette, spacing }) => ({
    "@keyframes fadeLow": {
        from: {
            opacity: 0.75
        },
        to: {
            opacity: 1
        }
    },
    "@keyframes fadeHigh": {
        from: {
            opacity: 0
        },
        to: {
            opacity: 1
        }
    },
    root: {
        position: 'relative',
        display: 'inline-block',
        pointerEvents: 'none',
        backdropFilter: 'blur(2px)'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: palette.background.paper,
        opacity: 0.5,
        zIndex: -1
    },
    content: {
        padding: spacing(1, 2),
        animationDuration: '250ms',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        animationTimingFunction: 'steps(2, jump-none)'
    },
    contentWaiting: {
        animationName: '$fadeLow'
    },
    contentGo: {
        animationName: '$fadeHigh'
    }
}));

const nbrRoundZeros = 3;
const roundNbr = 10 ** nbrRoundZeros;
const round = (value: number) => Math.ceil(value / roundNbr) * roundNbr;

export const BattleTurnAnnoucement: React.FC = () => {
    const classes = useStyles();
    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const isMyCharacterPlaying = useIsMyCharacterPlaying();
    const currentPlayerName = useBattleSelector(battle => battle.playingCharacterId
        ? battle.staticPlayers[ battle.staticCharacters[ battle.playingCharacterId ].playerId ].playerName
        : null);

    const remainingSeconds = useCadencedTime(
        React.useCallback(now => {
            const rawDuration = Math.max(turnStartTime - now, -2000);

            return round(rawDuration) / 1000;
        }, [ turnStartTime ])
    );

    const getContent = () => {
        if (isMyCharacterPlaying) {
            if (remainingSeconds > 0) {
                return <div className={clsx(classes.content, classes.contentWaiting)}>
                    <UIText variant='body1'>
                        your turn in.. <b>{remainingSeconds}</b>
                    </UIText>
                </div>;
            }

            if (remainingSeconds > -2) {
                return <div className={clsx(classes.content, classes.contentGo)}>
                    <UIText variant='h3'>
                        <b>GO !</b>
                    </UIText>
                </div>;
            }
        }

        if (remainingSeconds > 0) {
            return <div className={classes.content}>
                <UIText variant='body1'>
                    <b>{currentPlayerName}</b> turn in.. {remainingSeconds}
                </UIText>
            </div>;
        }
    };

    if (!currentPlayerName || remainingSeconds <= -2) {
        return null;
    }

    return <div className={classes.root}>
        <div className={classes.background} />
        {getContent()}
    </div>;
};
