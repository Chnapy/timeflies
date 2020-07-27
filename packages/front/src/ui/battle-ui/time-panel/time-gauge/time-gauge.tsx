import { Box } from '@material-ui/core';
import React from "react";
import { shallowEqual } from 'react-redux';
import { getTurnRemainingTime } from '../../../../stages/battle/cycle/cycle-reducer';
import { useGameStep } from '../../../hooks/useGameStep';
import { SpellNumber } from '../../spell-panel/spell-button/spell-number';
import { UIGauge } from '../../spell-panel/spell-button/ui-gauge';
import { SpellTimeGauge } from './spell-time-gauge';


export const TimeGauge: React.FC = () => {

    const { turnDuration, remainingTime } = useGameStep('battle', battle => {
        const { turnStartTime, turnDuration } = battle.cycleState;

        return {
            startTime: turnStartTime,
            turnDuration: turnDuration,
            remainingTime: getTurnRemainingTime(battle, 'current')
        };
    }, (a, b) => a.startTime === b.startTime);

    const spellActionStartTimeList = useGameStep('battle',
        ({ snapshotState }) =>
            snapshotState.spellActionSnapshotList.map(spellAction => spellAction.startTime),
        shallowEqual
    );

    return <Box position='relative' display='flex' alignItems='center' flexGrow={1} color='primary.main'>

        <Box width={0} overflow='hidden'>
            <SpellNumber value={0} />
        </Box>

        <UIGauge variant='dynamic' timeElapsed={turnDuration - remainingTime} durationTotal={turnDuration} />

        {spellActionStartTimeList.map((startTime) => {

            return <Box key={startTime} position='absolute' left={0} right={0} top={0} bottom={0}>
                <SpellTimeGauge spellActionStartTime={startTime} />
            </Box>;
        })}

    </Box>;
};
