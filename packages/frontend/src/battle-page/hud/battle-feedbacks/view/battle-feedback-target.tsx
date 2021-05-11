import { BattleFeedback } from '@timeflies/battle-feedback';
import { Position } from '@timeflies/common';
import React from 'react';
import { useTargetFeedbackProps } from '../hooks/use-target-feedback-props';

type BattleFeedbackTargetProps = {
    posId: Position[ 'id' ];
};

export const BattleFeedbackTarget: React.FC<BattleFeedbackTargetProps> = React.memo(({ posId }) => {
    const feedbackProps = useTargetFeedbackProps(posId);

    return feedbackProps && (
        <BattleFeedback {...feedbackProps} />
    );
});
