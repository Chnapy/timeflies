import { Box } from '@material-ui/core';
import { VariableIcon } from '@timeflies/app-ui';
import { EntitiesVariablesName, SpellCategory } from '@timeflies/common';
import React from 'react';
import { FeedbackEffectContainer } from './feedback-effect-container';

type FeedbackEffectCondensedProps = {
    spellCategory: SpellCategory;
    variableNameList: EntitiesVariablesName[];
};

export const FeedbackEffectCondensed: React.FC<FeedbackEffectCondensedProps> = ({
    spellCategory, variableNameList
}) => {

    return (
        <FeedbackEffectContainer spellCategory={spellCategory}>
            {variableNameList.map(variableName => (
                <Box key={variableName} display='inline-flex' mr={0.5}>
                    <VariableIcon variableName={variableName} />
                </Box>
            ))}
        </FeedbackEffectContainer>
    );
};
