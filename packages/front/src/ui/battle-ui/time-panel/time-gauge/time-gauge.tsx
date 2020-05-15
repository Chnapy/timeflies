import React from "react";
import { Box } from '@material-ui/core';
import { useGameStep } from '../../../hooks/useGameStep';
import { UIGauge } from '../../spell-panel/spell-button/ui-gauge';
import { SpellNumber } from '../../spell-panel/spell-button/spell-number';
import { SpellTimeGauge } from './spell-time-gauge';


export const TimeGauge: React.FC = () => {

    const turnDuration = useGameStep('battle', ({ cycle }) =>
        cycle.globalTurn?.currentTurn.turnDuration ?? 0);

    const remainingTime = useGameStep('battle', ({ cycle }) =>
        cycle.globalTurn?.currentTurn.getRemainingTime('current') ?? 0);

    const spellActionStartTimeList = useGameStep('battle', ({ future }) => (console.log(future.spellActionSnapshotList[0]) as any) ||
        future.spellActionSnapshotList.map(spellAction => spellAction.startTime),
        (a, b) => a.length === b.length);

    const renderSpellGauges = () => spellActionStartTimeList.map((startTime) => {

        return <Box key={startTime} position='absolute' left={0} right={0} top={0} bottom={0}>
            <SpellTimeGauge spellActionStartTime={startTime} />
        </Box>;
    });

    return <Box position='relative' display='flex' alignItems='center' flexGrow={1}>

        <Box width={0} overflow='hidden'>
            <SpellNumber value={0} />
        </Box>

        <UIGauge variant='dynamic' timeElapsed={turnDuration - remainingTime} durationTotal={turnDuration} />

        {renderSpellGauges()}

    </Box>;
};
