import { Box } from '@material-ui/core';
import { SpellIcon, VariableValue } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import React from 'react';
import { FeedbackContainer, feedbackItemHeight } from './feedback-container';

export type FeedbackSpellProps = {
    spellRole: SpellRole;
    startTime: number;
    duration: number;
};

export const FeedbackSpell: React.FC<FeedbackSpellProps> = ({ spellRole }) => {

    // TODO create package for time components

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
                <VariableValue variableName='duration' value={2300} />
            </Box>
        }
        bottom={' '}
    />;
};
