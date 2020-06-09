import { Box, Button, ButtonProps, Tooltip } from '@material-ui/core';
import { Theme, useTheme } from '@material-ui/core/styles';
import { assertIsDefined, switchUtil } from '@timeflies/shared';
import React from 'react';
import { BattleStateSpellPrepareAction } from '../../../../stages/battle/battleState/battle-state-actions';
import { Spell } from '../../../../stages/battle/entities/spell/Spell';
import { useGameStep } from '../../../hooks/useGameStep';
import { SpellImage } from './spell-image';
import { SpellNumber } from './spell-number';
import { UIIcon, UIIconValue } from './ui-icon';
import { formatMsToSeconds, UIText } from './ui-text';
import { UIGauge } from './ui-gauge';
import { useGameDispatch } from '../../../hooks/useGameDispatch';
import { BattleState } from '../../../reducers/battle-reducers/battle-reducer';
import { getTurnRemainingTime } from '../../../../stages/battle/cycle/cycle-reducer';
import { playerIsMine } from '../../../../stages/battle/entities/player/Player';
import { useGameSelector } from '../../../hooks/useGameSelector';
import { useStore } from 'react-redux';
import { GameState } from '../../../../game-state';

export interface SpellButtonProps {
    spellId: string;
}

export const SpellButton: React.FC<SpellButtonProps> = React.memo(({ spellId }) => {

    const spellIndex = useGameStep('battle', ({ snapshotState }) =>
        snapshotState.battleDataCurrent.spells.findIndex(s => s.id === spellId));

    const selectSpell = ({ snapshotState }: BattleState): Spell<'current'> =>
        snapshotState.battleDataCurrent.spells[ spellIndex ];

    const now = Date.now();

    const index = useGameStep('battle', battle => selectSpell(battle).index);

    const duration = useGameStep('battle', battle => selectSpell(battle).feature.duration);

    const attack = useGameStep('battle', battle => selectSpell(battle).feature.attack);

    const spellType = useGameStep('battle', battle => selectSpell(battle).staticData.type);

    const nbrWaitingSpellAction: number = useGameStep('battle', battle => {
        const { spellActionSnapshotList } = battle.snapshotState;

        return spellActionSnapshotList.filter(spellAction =>
            spellAction.spellId === spellId
            && spellAction.startTime > now
        ).length;
    });

    const currentSpellActionStartTime = useGameStep('battle', battle => {
        const { spellActionSnapshotList } = battle.snapshotState;

        const spellAction = spellActionSnapshotList.find(_spellAction =>
            _spellAction.spellId === spellId
            && _spellAction.startTime <= now
            && _spellAction.startTime + _spellAction.duration > now
        );

        return spellAction
            ? spellAction.startTime
            : undefined;
    });

    const currentSpellActionDuration = useGameStep('battle', battle => {

        if (!currentSpellActionStartTime) {
            return;
        }

        const { spellActionSnapshotList } = battle.snapshotState;

        const spellAction = spellActionSnapshotList.find(_spellAction =>
            _spellAction.startTime === currentSpellActionStartTime
        );
        assertIsDefined(spellAction);

        return spellAction.duration;
    });

    const currentSpellActionInfos = currentSpellActionStartTime
        ? {
            timeElapsed: now - currentSpellActionStartTime,
            duration: currentSpellActionDuration!
        }
        : null;

    const isSelected = useGameStep('battle', ({ battleActionState }) =>
        battleActionState.selectedSpellId === spellId);

    const disableReason = useGameSelector(gameState => {
        const { snapshotState, cycleState } = gameState.battle;

        const currentCharacter = snapshotState.battleDataCurrent.characters
            .find(c => c.id === cycleState.currentCharacterId)!;

        if (!playerIsMine(gameState, currentCharacter.playerId)) {
            return 'player';
        }

        if (getTurnRemainingTime(gameState.battle, 'future') < duration) {
            return 'time';
        }

        return;
    });

    const isDisabled = !!disableReason;

    const store = useStore<GameState>();

    const { dispatchSpellPrepare } = useGameDispatch({
        dispatchSpellPrepare: () => {
            const { battleDataFuture } = store.getState().battle.snapshotState;

            const futureSpell = battleDataFuture.spells.find(s => s.id === spellId)!;
            const futureCharacter = battleDataFuture.characters.find(c => c.id === futureSpell.characterId)!;

            return BattleStateSpellPrepareAction({
                futureSpell,
                futureCharacter
            });
        }
    });

    const onBtnClick = React.useCallback((): void => {
        if (isDisabled) {
            return;
        }

        dispatchSpellPrepare();
    }, [ dispatchSpellPrepare, isDisabled ]);

    const renderAttribute = (icon: UIIconValue, value: React.ReactText) => (
        <Box display='flex' flexWrap='nowrap' alignItems='center'>
            <UIIcon icon={icon} />
            <Box ml={0.5}>
                <UIText variant='numeric'>{value}</UIText>
            </Box>
        </Box>
    );

    const renderDisableIcon = () => switchUtil(disableReason ?? 'none', {
        none: null,
        time: <UIIcon icon='time' strikeOut />,
        player: <UIIcon icon='play' strikeOut />
    });

    const buttonProps: ButtonProps = isSelected
        ? {
            variant: 'contained',
            disableElevation: true
        }
        : {
            variant: 'outlined'
        };

    const { palette } = useTheme<Theme>();

    const renderPoint = (key: number) =>
        <Box key={key} width={4} height={4} borderRadius={10} bgcolor={palette.primary.main} mr={'1px'} />;

    return (
        <Box display='flex' flexDirection='column'>

            <Box display='flex' height={4} mx={0.5} mb={0.5}>
                {[ ...new Array(nbrWaitingSpellAction) ].map((_, i) => renderPoint(i))}
                {currentSpellActionInfos && <UIGauge variant='dynamic' timeElapsed={currentSpellActionInfos.timeElapsed} durationTotal={currentSpellActionInfos.duration} />}
            </Box>

            <Tooltip title={'Spell description'}>
                <Button component='span' onClick={onBtnClick} size='large' color='primary' disabled={isDisabled} {...buttonProps}>

                    <Box display='flex' flexWrap='nowrap'>

                        <Box
                            display='flex'
                            border={1}
                            borderColor={'currentColor'}
                            bgcolor={palette.primary.main}
                            borderRadius={2}
                            style={{ opacity: isDisabled ? .25 : 1 }}
                        >
                            <SpellImage spellType={spellType} size={48} />
                        </Box>

                        <Box display='flex' flexDirection='column' justifyContent='space-evenly' ml={1}>
                            {renderAttribute('time', formatMsToSeconds(duration) + 's')}
                            {renderAttribute('attack', attack)}
                        </Box>

                    </Box>

                    <Box position='absolute' left={0} bottom={0} style={{
                        transform: 'translate(-25%, 25%)'
                    }}>
                        <SpellNumber value={index} disabled={isDisabled} />
                    </Box>

                    <Box color={palette.primary.main} position='absolute' top={4} right={4}>
                        {renderDisableIcon()}
                    </Box>

                </Button>
            </Tooltip>
        </Box>
    );
});