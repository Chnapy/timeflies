import { Box } from '@material-ui/core';
import { SpellIcon, TimeProps } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import { TimeCounter, TimeGauge } from '@timeflies/time-gauge-panel';
import React from 'react';
import { FeedbackContainer, feedbackItemHeight } from './feedback-container';

export type FeedbackSpellProps<T extends TimeProps = TimeProps> = T & {
    spellRole: SpellRole;
};

export const FeedbackSpell: React.FC<FeedbackSpellProps> = ({ spellRole, ...timeProps }) => {

    return <FeedbackContainer
        left={
            <SpellIcon
                spellRole={spellRole}
                size={feedbackItemHeight}
                padding={2}
            />
        }
        right={
            <Box mr={0.5}>
                <TimeCounter {...timeProps} />
            </Box>
        }
        bottom={
            <Box width='100%' p={0.25}>
                <TimeGauge {...timeProps} />
            </Box>
        }
    />;
};
