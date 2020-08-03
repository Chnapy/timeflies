import { Box, Tooltip } from '@material-ui/core';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { assertIsDefined, switchUtil } from '@timeflies/shared';
import clsx from 'clsx';
import React from 'react';
import { useStore } from 'react-redux';
import { GameState } from '../../../../game-state';
import { BattleStateSpellPrepareAction } from '../../../../stages/battle/battleState/battle-state-actions';
import { Spell, spellIsUsable } from '../../../../stages/battle/entities/spell/Spell';
import { useGameDispatch } from '../../../hooks/useGameDispatch';
import { useGameSelector } from '../../../hooks/useGameSelector';
import { useGameStep } from '../../../hooks/useGameStep';
import { BattleState } from '../../../reducers/battle-reducers/battle-reducer';
import { UIButton } from '../../../ui-components/button/ui-button';
import { UITypography } from '../../../ui-components/typography/ui-typography';
import { SpellImage } from './spell-image';
import { SpellNumber } from './spell-number';
import { UIGauge } from './ui-gauge';
import { UIIcon, UIIconValue } from './ui-icon';
import { formatMsToSeconds } from './ui-text';

export type SpellButtonProps = {
    spellId: string;
};

type StyleProps = {
    selected: boolean;
    disabled: boolean;
};

const useStyles = makeStyles(({ palette }) => ({
    btn: {
        backgroundColor: palette.background.level1
    },
    btnSelected: {
        backgroundColor: palette.background.default + ' !important',
        borderColor: palette.common.white,
        cursor: 'default'
    },
    attribute: ({ disabled }: StyleProps) => ({
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        textTransform: 'none',
        opacity: disabled ? 0.5 : 1
    }),
    time: {
        color: palette.features.time
    },
    attack: {
        color: palette.features.attack
    },
    rangeArea: {
        color: palette.features.rangeArea
    },
    actionArea: {
        color: palette.features.actionArea
    },
    spellImage: ({ selected, disabled }: StyleProps) => ({
        display: 'flex',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: selected ? 'currentColor' : 'transparent',
        opacity: disabled ? 0.5 : 1
    })
}));

export const SpellButton: React.FC<SpellButtonProps> = React.memo(({ spellId }) => {

    const selectSpell = ({ snapshotState }: BattleState): Spell<'current'> =>
        snapshotState.battleDataCurrent.spells[spellId];

    const now = Date.now();

    const index = useGameStep('battle', battle => selectSpell(battle).index);

    const duration = useGameStep('battle', battle => selectSpell(battle).features.duration);
    const rangeArea = useGameStep('battle', battle => selectSpell(battle).features.rangeArea);
    const actionArea = useGameStep('battle', battle => selectSpell(battle).features.actionArea);
    const attack = useGameStep('battle', battle => selectSpell(battle).features.attack);

    const spellRole = useGameStep('battle', battle => selectSpell(battle).staticData.role);

    const spellDescription = useGameStep('battle', battle => selectSpell(battle).staticData.description);

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

    const disableReason = useGameSelector(gameState => {

        return spellIsUsable(gameState, spellId).reason;
    });

    const isDisabled = !!disableReason;

    const isSelected = useGameStep('battle', ({ battleActionState }) =>
        battleActionState.selectedSpellId === spellId)
        && !isDisabled;

    const store = useStore<GameState>();

    const { dispatchSpellPrepare } = useGameDispatch({
        dispatchSpellPrepare: () => {
            const { battleDataFuture } = store.getState().battle.snapshotState;

            const futureSpell = battleDataFuture.spells[spellId];
            const futureCharacter = battleDataFuture.characters[futureSpell.characterId];

            return BattleStateSpellPrepareAction({
                futureSpell,
                futureCharacter
            });
        }
    });

    const onBtnClick = React.useCallback(() => {
        if (isDisabled) {
            return;
        }

        return dispatchSpellPrepare();
    }, [dispatchSpellPrepare, isDisabled]);

    const classes = useStyles({
        selected: isSelected,
        disabled: isDisabled
    });

    const renderAttribute = (icon: Extract<UIIconValue, keyof typeof classes>, value: React.ReactText) => (
        <Box display='flex' flexWrap='nowrap' alignItems='center'>
            <div className={clsx(classes.attribute, classes[icon])}>
                <UIIcon icon={icon} />
                <Box ml={0.5}>
                    <UITypography variant='numeric'>{value}</UITypography>
                </Box>
            </div>
        </Box>
    );

    const renderDisableIcon = () => switchUtil(disableReason ?? 'none', {
        none: null,
        time: <UIIcon icon='time' strikeOut />,
        player: <UIIcon icon='play' strikeOut />
    });

    const { palette } = useTheme<Theme>();

    const renderPoint = (key: number) =>
        <Box key={key} width={4} height={4} bgcolor='currentColor' mr={'1px'} />;

    return (
        <Box display='flex' flexDirection='column'>

            <Box color='primary.main' display='flex' height={4} mx={0.5} mb={0.5}>
                {[...new Array(nbrWaitingSpellAction)].map((_, i) => renderPoint(i))}
                {currentSpellActionInfos
                    && <UIGauge variant='dynamic' timeElapsed={currentSpellActionInfos.timeElapsed} durationTotal={currentSpellActionInfos.duration} />
                }
            </Box>

            <Tooltip title={spellDescription}>
                <span>
                    <UIButton className={clsx(classes.btn, {
                        [classes.btnSelected]: isSelected
                    })} onClick={onBtnClick} disabled={isDisabled}>

                        <Box display='flex' flexWrap='nowrap'>

                            <div className={classes.spellImage}>
                                <SpellImage spellRole={spellRole} size={48} />
                            </div>

                            <Box display='flex' flexDirection='column' justifyContent='space-between' my={0.25} ml={1.5}>
                                {renderAttribute('time', formatMsToSeconds(duration) + 's')}
                                {attack !== undefined && renderAttribute('attack', attack)}
                            </Box>

                            <Box display='flex' flexDirection='column' justifyContent='space-between' my={0.25} ml={1.5}>
                                {renderAttribute('rangeArea', rangeArea >= 0 ? rangeArea : '-')}
                                {renderAttribute('actionArea', actionArea + 1)}
                            </Box>

                        </Box>

                        <Box position='absolute' left={-2} bottom={-5}>
                            <SpellNumber value={index} />
                        </Box>

                        <Box color={palette.background.default} position='absolute' top={2} right={2} display='flex' alignItems='flex-start'>
                            {renderDisableIcon()}
                        </Box>

                    </UIButton>
                </span>
            </Tooltip>
        </Box>
    );
});