import { Box, Paper } from '@material-ui/core';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { assertIsDefined, switchUtil } from '@timeflies/shared';
import clsx from 'clsx';
import React from "react";
import { getTurnRemainingTime } from '../../../../stages/battle/cycle/cycle-reducer';
import { useGameCurrentPlayer } from '../../../hooks/useGameCurrentPlayer';
import { useGameStep } from '../../../hooks/useGameStep';
import { BattleState } from '../../../reducers/battle-reducers/battle-reducer';
import { TeamIndicator } from '../../../room-ui/map-board/map-board-tile/team-indicator';
import { UITypography } from '../../../ui-components/typography/ui-typography';
import { UIGauge } from '../../spell-panel/spell-button/ui-gauge';
import { UIIcon } from '../../spell-panel/spell-button/ui-icon';
import { formatMsToSeconds } from '../../spell-panel/spell-button/ui-text';
import { CharacterImage } from './character-image';

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
            disabled: {},
            current: {}
        })
    }),
    card: ({ state }: { state: CharacterState }) => ({
        position: 'relative',
        backgroundColor: palette.background.level1,
        color: 'currentColor',
        ...switchUtil(state, {
            default: {},
            disabled: {
                opacity: 0.5
            },
            current: {
                backgroundColor: palette.background.default,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: palette.common.white
            }
        })
    }),
    related: {
        padding: '3px 6px',
        color: palette.common.white,
        backgroundColor: palette.background.default
    },
    attributeWrapper: {
        display: 'flex',
        alignItems: 'center'
    },
    attributeWrapperLife: {
        color: palette.features.life
    },
    attributeWrapperTime: {
        color: palette.features.time
    },
    gauge: ({ state }: { state: CharacterState }) => ({
        ...switchUtil(state, {
            default: {},
            disabled: {},
            current: {
                backgroundColor: palette.background.level1,
            }
        })
    })
}));

const characterSelector = ({ snapshotState }: BattleState, characterId: string) => {
    const character = snapshotState.battleDataCurrent.characters[ characterId ];
    assertIsDefined(character);

    return character;
};

const playerSelector = ({ snapshotState }: BattleState, playerId: string) => {
    const player = snapshotState.playerList[ playerId ];
    assertIsDefined(player);

    return player;
};

type CharacterState = 'default' | 'disabled' | 'current';

export const CharacterItem: React.FC<CharacterItemProps> = React.memo(({ characterId }) => {

    const currentPlayerId = useGameCurrentPlayer(({ id }) => id);

    const playerId = useGameStep('battle', battle => characterSelector(battle, characterId).playerId);

    const related: 'me' | 'ally' | 'ennemy' = useGameStep('battle', battle => {

        if (playerId === currentPlayerId) {
            return 'me';
        }

        const t1 = battle.snapshotState.playerList[ playerId ].teamId;
        const t2 = battle.snapshotState.playerList[ currentPlayerId ].teamId;

        if (t1 === t2) {
            return 'ally';
        }

        return 'ennemy';
    });

    const playerName = useGameStep('battle', battle => playerSelector(battle, playerId).name);

    const teamLetter = useGameStep('battle', battle => {

        const { teamId } = playerSelector(battle, playerId);

        return battle.snapshotState.teamList[ teamId ].letter;
    });

    const characterRole = useGameStep('battle', battle =>
        characterSelector(battle, characterId).staticData.role);

    const lifeTotal = useGameStep('battle', battle =>
        characterSelector(battle, characterId).staticData.initialFeatures.life);

    const life = useGameStep('battle', battle =>
        characterSelector(battle, characterId).features.life);

    const actionTime = useGameStep('battle', battle =>
        characterSelector(battle, characterId).features.actionTime);

    const { startTime, turnDuration, getRemainingTimeRaw } = useGameStep('battle', battle => {

        const { currentCharacterId, turnStartTime, turnDuration } = battle.cycleState;

        if (currentCharacterId !== characterId) {
            return {
                startTime: 0,
                turnDuration: 0,
                getRemainingTimeRaw: () => 0
            };
        }

        return {
            startTime: turnStartTime,
            turnDuration: turnDuration,
            getRemainingTimeRaw: () => getTurnRemainingTime(battle, 'current')
        };

    }, (a, b) => a.startTime === b.startTime);

    const getRemainingTime = React.useCallback(() => getRemainingTimeRaw(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ startTime ]);

    const state: CharacterState = life === 0 ? 'disabled'
        : turnDuration !== 0 ? 'current'
            : 'default';

    const classes = useStyles({ state });

    const { palette, shape } = useTheme<Theme>();

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
                <UITypography className={classes.related} variant='labelMini' />
            </Box>;
        }

        return <UITypography className={classes.related} variant='labelMini'>
            {switchUtil(related, {
                me: null,
                ally: 'Ally',
                ennemy: 'Ennemy'
            })}
        </UITypography>;
    };

    return <div className={classes.root}>

        <Box display='flex' alignItems='flex-end' justifyContent='space-between' pl={leftSideWidth + 2 + 'px'} pb={0.25}>
            <Box>
                <UITypography variant='body2'>{playerName}</UITypography>
            </Box>

            <Box>
                {renderRelated()}
            </Box>
        </Box>

        <Box display='flex' flexGrow={1}>

            <Box display='flex' alignItems='center' width={leftSideWidth}>
                <TeamIndicator teamLetter={teamLetter} />
            </Box>

            <Box display='flex' flexDirection='column' flexGrow={1}>

                <Paper className={classes.card}>
                    <Box display='flex' alignItems='center' my={0.5} mx={1}>

                        <Box display='flex' alignItems='center' justifyContent='center' width={48} height={48}
                            bgcolor={state === 'current' ? palette.primary.contrastText : undefined} borderRadius={shape.borderRadius}>
                            <CharacterImage characterRole={characterRole} size={48} />
                        </Box>

                        <Box display='flex' flexDirection='column' flexGrow={1} ml={1}>

                            <UITypography variant='labelMini'>{characterRole}</UITypography>

                            <div className={clsx(classes.attributeWrapper, classes.attributeWrapperLife)}>
                                <UITypography variant='body1'>
                                    <UIIcon icon='life' />
                                </UITypography>
                                <Box width={26} textAlign='right' flexShrink={0} mx={0.5}>
                                    <UITypography variant='numeric'>{life}</UITypography>
                                </Box>
                                <UIGauge className={classes.gauge} variant='static' timeElapsed={lifeTotal - life} durationTotal={lifeTotal} />
                            </div>

                            <div className={clsx(classes.attributeWrapper, classes.attributeWrapperTime)}>
                                <UITypography variant='body1'>
                                    <UIIcon icon='time' />
                                </UITypography>
                                <Box width={26} textAlign='right' flexShrink={0} mx={0.5}>
                                    <UITypography variant='numeric'>
                                        <span ref={actionTimeSpan}>{formatMsToSeconds(initialActionTime)}</span>s
                                </UITypography>
                                </Box>
                                {state === 'current' && <UIGauge className={classes.gauge} variant='dynamic' timeElapsed={turnDuration - getRemainingTime()} durationTotal={turnDuration} />}
                            </div>

                        </Box>

                    </Box>

                    <Box color={'background.default'} position='absolute' top={4} right={4}>
                        {state === 'disabled' &&
                            <UITypography variant='body1' style={{ display: 'flex' }}>
                                <UIIcon icon='life' strikeOut />
                            </UITypography>
                        }
                    </Box>
                </Paper>

            </Box>

        </Box>

    </div>;
});
