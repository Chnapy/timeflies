import { Box } from '@material-ui/core';
import React from 'react';
import { useGameStep } from '../../../hooks/useGameStep';
import { assertIsDefined } from '@timeflies/shared';
import { SpellNumber } from '../../spell-panel/spell-button/spell-number';

export type SpellTimeGaugeProps = {
    spellActionStartTime: number;
};

export const SpellTimeGauge: React.FC<SpellTimeGaugeProps> = React.memo(({ spellActionStartTime }) => {

    const turnStartTime = useGameStep('battle', ({ cycle }) =>
        cycle.globalTurn?.currentTurn.startTime ?? 0);

    const turnDuration = useGameStep('battle', ({ cycle }) =>
        cycle.globalTurn?.currentTurn.turnDuration ?? 0);

    const { startTimeFromTurnStart, duration, index, finished } = useGameStep('battle', ({ future }) => {

        const spellAction = future.spellActionSnapshotList.find(sa => sa.startTime === spellActionStartTime);
        assertIsDefined(spellAction);

        return {
            startTimeFromTurnStart: spellAction.startTime - turnStartTime,
            duration: spellAction.duration,
            finished: spellAction.startTime + spellAction.duration < Date.now(),
            index: 1
        };
    }, (a, b) => (a.startTimeFromTurnStart === b.startTimeFromTurnStart) && (a.finished === b.finished));

    const paddingLeft = 2;

    const leftPercent = (turnDuration - startTimeFromTurnStart - duration) / turnDuration * 100;

    return <Box display='flex' alignItems='center'>
        <Box
            position='absolute' top={0} left={`calc(${leftPercent}% - ${paddingLeft}px)`}
            display='flex' alignItems='center'
        >
            <Box display='inline-flex' height={4} bgcolor='#E7E7E7' width={paddingLeft + 2} mr={'-2px'} />
            <SpellNumber value={index} disabled={finished}/>
        </Box>
    </Box>;
});
