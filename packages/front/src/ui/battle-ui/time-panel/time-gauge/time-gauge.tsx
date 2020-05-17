import React from "react";
import { Box } from '@material-ui/core';
import { useGameStep } from '../../../hooks/useGameStep';
import { UIGauge } from '../../spell-panel/spell-button/ui-gauge';
import { SpellNumber } from '../../spell-panel/spell-button/spell-number';
import { SpellTimeGauge } from './spell-time-gauge';


export const TimeGauge: React.FC = () => {

    const { turnDuration, remainingTime } = useGameStep('battle', ({ cycle }) => {
        if (!cycle.globalTurn) {
            return {
                startTime: 0,
                turnDuration: 0,
                remainingTime: 0
            };
        }

        const { currentTurn } = cycle.globalTurn;
        return {
            startTime: currentTurn.startTime,
            turnDuration: currentTurn.turnDuration,
            remainingTime: currentTurn.getRemainingTime('current')
        };
    }, (a, b) => a.startTime === b.startTime);

    const spellActionStartTimeList = useGameStep('battle', ({ future }) =>
        future.spellActionSnapshotList.map(spellAction => spellAction.startTime),
        (a, b) => a.length === b.length);


    return <Box position='relative' display='flex' alignItems='center' flexGrow={1}>

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
