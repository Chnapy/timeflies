import { Box, Button, ButtonProps, Tooltip } from '@material-ui/core';
import { Theme, useTheme } from '@material-ui/core/styles';
import { assertIsDefined, switchUtil } from '@timeflies/shared';
import React from 'react';
import { BattleDataMap } from '../../../../BattleData';
import { serviceDispatch } from '../../../../services/serviceDispatch';
import { BStateSpellPrepareAction } from '../../../../stages/battle/battleState/BattleStateSchema';
import { Turn } from '../../../../stages/battle/cycle/Turn';
import { Character } from '../../../../stages/battle/entities/character/Character';
import { Spell } from '../../../../stages/battle/entities/spell/Spell';
import { useGameStep } from '../../../hooks/useGameStep';
import { SpellImage } from './spell-image';
import { SpellNumber } from './spell-number';
import { UIIcon, UIIconValue } from './ui-icon';
import { formatMsToSeconds, UIText } from './ui-text';
import { UIGauge } from './ui-gauge';

export interface SpellButtonProps {
    spellId: string;
}

export const SpellButton: React.FC<SpellButtonProps> = React.memo(({ spellId }) => {

    const selectCurrentTurn = ({ cycle }: BattleDataMap): Turn => {
        assertIsDefined(cycle.globalTurn);
        return cycle.globalTurn.currentTurn;
    };

    const selectCurrentCharacter = (battle: BattleDataMap): Character<'current'> =>
        selectCurrentTurn(battle).character;

    const spellIndex = useGameStep('battle', battle => selectCurrentCharacter(battle).spells
        .findIndex(spell => spell.id === spellId)
    );

    const selectSpell = (battle: BattleDataMap): Spell<'current'> =>
        selectCurrentCharacter(battle).spells[ spellIndex ];

    const now = Date.now();

    const duration = useGameStep('battle', battle => selectSpell(battle).feature.duration);

    const attack = useGameStep('battle', battle => selectSpell(battle).feature.attack);

    const spellType = useGameStep('battle', battle => selectSpell(battle).staticData.type);

    const nbrWaitingSpellAction: number = useGameStep('battle', battle => {
        const { spellActionSnapshotList } = battle.future;

        return spellActionSnapshotList.filter(spellAction =>
            spellAction.spellId === spellId
            && spellAction.startTime > now
        ).length;
    });

    const currentSpellActionStartTime = useGameStep('battle', battle => {
        const { spellActionSnapshotList } = battle.future;

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

        const { spellActionSnapshotList } = battle.future;

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

    const isSelected = useGameStep('battle', battle => selectCurrentTurn(battle).currentSpellType === spellType);

    const disableReason = useGameStep('battle', battle => {

        if (!selectCurrentCharacter(battle).isMine) {
            return 'player';
        }

        if (selectCurrentTurn(battle).getRemainingTime('future') < duration) {
            return 'time';
        }

        return;
    });

    const isDisabled = !!disableReason;

    const spellNumber = spellIndex + 1;

    const onBtnClick = React.useCallback((): void => {
        if (isDisabled) {
            return;
        }

        const { dispatchSpellPrepare } = serviceDispatch({
            dispatchSpellPrepare: (): BStateSpellPrepareAction => ({
                type: 'battle/state/event',
                eventType: 'SPELL-PREPARE',
                payload: {
                    spellType
                }
            })
        });

        dispatchSpellPrepare();
    }, [ spellType, isDisabled ]);

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
                {currentSpellActionInfos && <UIGauge timeElapsed={currentSpellActionInfos.timeElapsed} durationTotal={currentSpellActionInfos.duration} />}
            </Box>

            <Tooltip title={'Spell description'}>
                <Button onClick={onBtnClick} size='large' color='primary' disabled={isDisabled} {...buttonProps}>

                    <Box display='flex' flexWrap='nowrap'>

                        <Box
                            display='flex'
                            border={1}
                            borderColor={'currentColor'}
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
                        <SpellNumber value={spellNumber} disabled={isDisabled} />
                    </Box>

                    <Box color={palette.primary.main} position='absolute' top={4} right={4}>
                        {renderDisableIcon()}
                    </Box>

                </Button>
            </Tooltip>
        </Box>
    );
});