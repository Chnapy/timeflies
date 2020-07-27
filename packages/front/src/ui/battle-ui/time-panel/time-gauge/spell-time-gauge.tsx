import { Box } from '@material-ui/core';
import React from 'react';
import { useGameStep } from '../../../hooks/useGameStep';
import { assertIsDefined } from '@timeflies/shared';
import { SpellNumber } from '../../spell-panel/spell-button/spell-number';

export type SpellTimeGaugeProps = {
    spellActionStartTime: number;
};

export const SpellTimeGauge: React.FC<SpellTimeGaugeProps> = React.memo(({ spellActionStartTime }) => {

    const turnStartTime = useGameStep('battle', ({ cycleState }) =>
        cycleState.turnStartTime);

    const turnDuration = useGameStep('battle', ({ cycleState }) =>
        cycleState.turnDuration);

    const { startTimeFromTurnStart, duration, finished } = useGameStep('battle', ({ snapshotState }) => {
        const { spellActionSnapshotList } = snapshotState;

        const spellAction = spellActionSnapshotList.find(sa => sa.startTime === spellActionStartTime);
        assertIsDefined(spellAction);

        return {
            startTimeFromTurnStart: spellAction.startTime - turnStartTime,
            duration: spellAction.duration,
            finished: spellAction.startTime + spellAction.duration < Date.now(),
        };
    }, (a, b) => (a.startTimeFromTurnStart === b.startTimeFromTurnStart) && (a.finished === b.finished));

    const spellIndex = useGameStep('battle', ({ snapshotState }) => {
        const { spellActionSnapshotList } = snapshotState;

        const spellAction = spellActionSnapshotList.find(sa => sa.startTime === spellActionStartTime)!;

        const { index } = snapshotState.battleDataCurrent.spells[ spellAction.spellId ];

        return index;
    });

    if (finished) {
        return null;
    }

    const paddingLeft = 2;

    const leftPercent = (turnDuration - startTimeFromTurnStart - duration) / turnDuration * 100;

    return <Box display='flex' alignItems='center'>
        <Box
            position='absolute'
            top={'50%'} left={`calc(${leftPercent}% - ${paddingLeft}px)`}
            display='flex' alignItems='center'
            style={{ transform: 'translateY(-50%)' }}
        >
            <Box display='inline-flex' height={4} bgcolor='background.default' width={paddingLeft + 2} mr={'-2px'} />
            <SpellNumber value={spellIndex} />
        </Box>
    </Box>;
});
