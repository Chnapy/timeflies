import { BattleFeedback } from '@timeflies/battle-feedback';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCharacterFeedbackProps } from '../../battle-feedbacks/hooks/use-character-feedback-props';

type CharacterHudFeedbackProps = {
    characterId: CharacterId;
};

export const CharacterHudFeedback: React.FC<CharacterHudFeedbackProps> = React.memo(({ characterId }) => {
    const feedbackProps = useCharacterFeedbackProps(characterId);

    return feedbackProps && (
        <BattleFeedback {...feedbackProps} />
    );
});
