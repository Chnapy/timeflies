import { Box } from '@material-ui/core';
import { VariableIcon, VariableValue } from '@timeflies/app-ui';
import { EntitiesVariables, EntitiesVariablesName, SpellCategory } from '@timeflies/common';
import React from 'react';
import { FeedbackEffectContainer } from './feedback-effect-container';

type FeedbackEffectProps<N extends EntitiesVariablesName = EntitiesVariablesName> = {
    spellCategory: SpellCategory;
    variableName: N;
    value: Required<EntitiesVariables>[ N ];
};

export const FeedbackEffect: React.FC<FeedbackEffectProps> = ({ spellCategory, variableName, value }) => {

    return (
        <FeedbackEffectContainer spellCategory={spellCategory}>
            <VariableValue variableName={variableName} value={value} relative colored />
            <Box display='inline-flex' mx={0.5}>
                <VariableIcon variableName={variableName} />
            </Box>
        </FeedbackEffectContainer>
    );
};
