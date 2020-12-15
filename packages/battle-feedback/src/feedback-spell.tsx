import { Box } from '@material-ui/core';
import { VariableValue } from '@timeflies/app-ui';
import { SpellCategory, SpellRole } from '@timeflies/common';
import React from 'react';
import { FeedbackContainer } from './feedback-container';

export type FeedbackSpellProps = {
    spellCategory: SpellCategory;
    spellRole: SpellRole;
    startTime: number;
    duration: number;
};

export const FeedbackSpell: React.FC<FeedbackSpellProps> = ({ }) => {

    // TODO create package for image rendering (from spritesheet)
    const getSpellRoleIcon = () => null;

    // TODO create package for time components

    return <FeedbackContainer
        left={getSpellRoleIcon()}
        right={
            <Box mr={0.5}>
                <VariableValue variableName='duration' value={2300} />
            </Box>
        }
        bottom={' '}
    />;
};
