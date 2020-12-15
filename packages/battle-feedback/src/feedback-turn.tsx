import { FeedbackContainer } from './feedback-container';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import React from 'react';
import { Box } from '@material-ui/core';
import { VariableValue } from '@timeflies/app-ui';

export type FeedbackTurnProps = {
    startTime: number;
    duration: number;
};

export const FeedbackTurn: React.FC<FeedbackTurnProps> = ({ }) => {

    return <FeedbackContainer
        left={<PlayArrowIcon />}
        right={
            <Box mr={0.5}>
                <VariableValue variableName='duration' value={2300} />
            </Box>
        }
        bottom={' '}
    />;
};
