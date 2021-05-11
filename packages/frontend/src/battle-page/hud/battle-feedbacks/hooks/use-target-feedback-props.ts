import { Position } from '@timeflies/common';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { useFeedbackPropsLoop } from './use-feedback-props-loop';

export const useTargetFeedbackProps = (targetPosId: Position[ 'id' ]) => {
    const staticSpells = useBattleSelector(battle => battle.staticSpells);

    const spellActionEffects = useBattleSelector(battle => battle.spellActionEffects);

    const feedbackPropsLoop = useFeedbackPropsLoop();

    const feedbackProps = feedbackPropsLoop((acc, startTime, period) => {
        const { spellAction } = spellActionEffects[ startTime ];

        const { targetPos, duration, spellId } = spellAction;

        if (targetPosId !== targetPos.id) {
            return acc;
        }

        const spellRole = staticSpells[ spellId ].spellRole;

        if (period === 'present') {
            acc = acc ?? {};
            acc.currentEffects = {
                spellRole,
                spellInfos: {
                    startTime,
                    duration
                }
            };
        }

        if (period === 'future') {
            acc = acc ?? {};
            acc.futureEffects = [
                ...acc.futureEffects ?? [],
                {
                    spellRole,
                    spellInfos: {
                        duration
                    }
                }
            ];
        }

        return acc;
    });

    return Object.keys(feedbackProps).length === 0
        ? null
        : feedbackProps;
};
