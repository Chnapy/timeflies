import { Box } from '@material-ui/core';
import { TimeCounter, TimeFullProps, TimeGauge, TurnIcon } from '@timeflies/app-ui';
import React from 'react';
import { FeedbackContainer } from './feedback-container';

export type FeedbackTurnProps = TimeFullProps;

export const FeedbackTurn: React.FC<FeedbackTurnProps> = props => {

    return <FeedbackContainer
        left={
            <Box display='flex' p={0.5}>
                <TurnIcon {...props} />
            </Box>}
        right={
            <Box mr={0.5}>
                <TimeCounter {...props} />
            </Box>
        }
        bottom={
            <Box width='100%' p={0.25}>
            <TimeGauge {...props} />
            </Box>
        }
    />;
};
