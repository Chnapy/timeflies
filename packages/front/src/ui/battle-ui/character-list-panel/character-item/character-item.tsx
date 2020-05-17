import React from "react";
import { Box, Paper, Chip } from '@material-ui/core';
import { makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import { TeamIndicator } from '../../../room-ui/map-board/map-board-tile/team-indicator';
import { UIText, formatMsToSeconds } from '../../spell-panel/spell-button/ui-text';
import { UIIcon } from '../../spell-panel/spell-button/ui-icon';
import { UIGauge } from '../../spell-panel/spell-button/ui-gauge';
import { useGameStep } from '../../../hooks/useGameStep';
import { assertIsDefined, switchUtil } from '@timeflies/shared';
import { BattleDataMap } from '../../../../BattleData';
import { CharacterImage } from './character-image';
import { useGameCurrentPlayer } from '../../../hooks/useGameCurrentPlayer';

export type CharacterItemProps = {
    characterId: string;
};

const leftSideWidth = 32;

const useStyles = makeStyles(({ palette }) => ({
    root: ({ state }: { state: CharacterState }) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        ...switchUtil(state, {
            default: {},
            disabled: {
                color: palette.action.disabled
            },
            current: {
                color: palette.primary.contrastText
            }
        })
    }),
    card: ({ state }: { state: CharacterState }) => ({
        position: 'relative',
        borderWidth: 2,
        borderColor: palette.primary.main,
        color: 'currentColor',
        ...switchUtil(state, {
            default: {},
            disabled: {
                borderColor: palette.action.disabled,
            },
            current: {
                backgroundColor: palette.primary.main,
            }
        })
    }),
    teamIndicator: ({ state }: { state: CharacterState }) => ({
        ...switchUtil(state, {
            default: {},
            disabled: {},
            current: {
                backgroundColor: palette.primary.main,
            }
        })
    }),
    gauge: ({ state }: { state: CharacterState }) => ({
        ...switchUtil(state, {
            default: {},
            disabled: {},
            current: {
                backgroundColor: '#666',
            }
        })
    })
}));

const characterSelector = (battle: BattleDataMap, characterId: string) => {
    const character = battle.current.characters.find(c => c.id === characterId);
    assertIsDefined(character);

    return character;
};

type CharacterState = 'default' | 'disabled' | 'current';

export const CharacterItem: React.FC<CharacterItemProps> = React.memo(({ characterId }) => {

    const related: 'me' | 'ally' | 'ennemy' = useGameStep('battle', battle => {

        const currentPlayerId = useGameCurrentPlayer(({ id }) => id);

        const { player } = characterSelector(battle, characterId);

        if (player.id === currentPlayerId) {
            return 'me';
        }

        if (player.team.players.some(p => p.id === currentPlayerId)) {
            return 'ally';
        }

        return 'ennemy';
    });

    const playerName = useGameStep('battle', battle =>
        characterSelector(battle, characterId).player.name);

    const teamLetter = useGameStep('battle', battle =>
        characterSelector(battle, characterId).player.team.name);

    const characterType = useGameStep('battle', battle =>
        characterSelector(battle, characterId).staticData.type);

    const lifeTotal = useGameStep('battle', battle =>
        characterSelector(battle, characterId).staticData.initialFeatures.life);

    const life = useGameStep('battle', battle =>
        characterSelector(battle, characterId).features.life);

    const actionTime = useGameStep('battle', battle =>
        characterSelector(battle, characterId).features.actionTime);

    const { turnDuration, getRemainingTime } = useGameStep('battle', ({ cycle }) => {

        if (cycle.globalTurn?.currentTurn.character.id !== characterId) {
            return {
                startTime: 0,
                turnDuration: 0,
                getRemainingTime: () => 0
            };
        }

        const { currentTurn } = cycle.globalTurn;
        return {
            startTime: currentTurn.startTime,
            turnDuration: currentTurn.turnDuration,
            getRemainingTime: () => currentTurn.getRemainingTime('current')
        };

    }, (a, b) => a.startTime === b.startTime);

    const state: CharacterState = life === 0 ? 'disabled'
        : turnDuration !== 0 ? 'current'
            : 'default';

    const classes = useStyles({ state });

    const { palette } = useTheme<Theme>();

    const actionTimeSpan = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {

        if (state !== 'current') {
            return;
        }

        const updateRemainingTime = () => {
            if (!actionTimeSpan.current) {
                return;
            }

            const remainingTime = getRemainingTime();

            actionTimeSpan.current.innerHTML = formatMsToSeconds(remainingTime);

            if (remainingTime) {
                requestAnimationFrame(updateRemainingTime);
            }
        };

        requestAnimationFrame(updateRemainingTime);

    }, [ getRemainingTime, state ]);

    const initialActionTime = state === 'current'
        ? getRemainingTime()
        : actionTime;

    const renderRelated = () => {

        if (related === 'me') {
            return <Box width={0} overflow='hidden'>
                <Chip size='small' />
            </Box>;
        }

        return <Chip variant={state === 'current' ? 'outlined' : 'default'} color='primary' size='small'
            label={<UIText variant='second'>
                {related === 'ally' ? 'Ally' : 'Ennemy'}
            </UIText>}
        />;
    };

    return <div className={classes.root}>

        <Box display='flex' alignItems='flex-end' justifyContent='space-between' pl={leftSideWidth + 2 + 'px'} pb={0.25}>
            <Box>
                <UIText variant='username'>{playerName}</UIText>
            </Box>

            <Box>
                {renderRelated()}
            </Box>
        </Box>

        <Box display='flex' flexGrow={1}>

            <Box display='flex' alignItems='center' width={leftSideWidth}>
                <TeamIndicator teamLetter={teamLetter} className={classes.teamIndicator} />
            </Box>

            <Box display='flex' flexDirection='column' flexGrow={1}>

                <Paper className={classes.card} variant='outlined'>
                    <Box display='flex' alignItems='center' m={0.5}>

                        <Box display='flex' alignItems='center' justifyContent='center' width={48} height={48}>
                            <CharacterImage characterType={characterType} />
                        </Box>

                        <Box display='flex' flexDirection='column' flexGrow={1} ml={1}>

                            <UIText variant='main'>{characterType}</UIText>

                            <Box display='flex' alignItems='center' mt={0.5}>
                                <UIIcon icon='life' />
                                <Box width={26} textAlign='right' flexShrink={0} mx={0.5}>
                                    <UIText variant='numeric'>{life}</UIText>
                                </Box>
                                <UIGauge className={classes.gauge} variant='static' timeElapsed={lifeTotal - life} durationTotal={lifeTotal} />
                            </Box>

                            <Box display='flex' alignItems='center' mt={0.5}>
                                <UIIcon icon='time' />
                                <Box width={26} textAlign='right' flexShrink={0} mx={0.5}>
                                    <UIText variant='numeric'>
                                        <span ref={actionTimeSpan}>{formatMsToSeconds(initialActionTime)}</span>s
                                </UIText>
                                </Box>
                                {state === 'current' && <UIGauge className={classes.gauge} variant='dynamic' timeElapsed={turnDuration - getRemainingTime()} durationTotal={turnDuration} />}
                            </Box>

                        </Box>

                    </Box>

                    <Box color={palette.primary.main} position='absolute' top={4} right={4}>
                        {state === 'disabled' && <UIIcon icon='life' strikeOut />}
                    </Box>
                </Paper>

            </Box>

        </Box>

    </div>;
});
