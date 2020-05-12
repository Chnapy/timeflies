import { Box, Button, ButtonProps, makeStyles } from '@material-ui/core';
import { assertIsDefined } from '@timeflies/shared';
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

export interface SpellButtonProps {
    spellId: string;
}

const useStyles = makeStyles(({ palette }) => ({
    outlined: {
        backgroundColor: palette.primary.contrastText
    }
}));

export const SpellButton: React.FC<SpellButtonProps> = ({ spellId }) => {

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

    const duration = useGameStep('battle', battle => selectSpell(battle).feature.duration);

    const attack = useGameStep('battle', battle => selectSpell(battle).feature.attack);

    const spellType = useGameStep('battle', battle => selectSpell(battle).staticData.type);

    const isSelected = useGameStep('battle', battle => selectCurrentTurn(battle).currentSpellType === spellType);

    const isDisabled = useGameStep('battle', battle => !selectCurrentCharacter(battle).isMine);

    // const isDisabled = useGameStep('battle', battle => {



    // });

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

    const buttonProps: ButtonProps = isSelected
        ? {
            variant: 'contained',
            disableElevation: true
        }
        : {
            variant: 'outlined'
        };

    const classes = useStyles();

    return <>
        <Button classes={classes} onClick={onBtnClick} size='large' color='primary' disabled={isDisabled} {...buttonProps}>

            <Box display='flex' flexWrap='nowrap'>

                <Box display='flex' style={{ opacity: isDisabled ? .25 : 1 }}>
                    <SpellImage spellType={spellType} size={48} />
                </Box>

                <Box display='flex' flexDirection='column' justifyContent='space-evenly' ml={1}>
                    {renderAttribute('time', formatMsToSeconds(duration))}
                    {renderAttribute('attack', attack)}
                </Box>

            </Box>

            <Box position='absolute' left={0} bottom={0} style={{
                transform: 'translate(-25%, 25%)'
            }}>
                <SpellNumber value={spellNumber} disabled={isDisabled} />
            </Box>

        </Button>
    </>;
};