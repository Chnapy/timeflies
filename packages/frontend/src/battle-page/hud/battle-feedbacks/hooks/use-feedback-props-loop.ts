import { BattleFeedbackProps } from '@timeflies/battle-feedback';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';

type FeedbackPropsLoopPeriod = 'past' | 'present' | 'future';

type FeedbackPropsLoopFn = (acc: BattleFeedbackProps, startTime: number, period: FeedbackPropsLoopPeriod) => BattleFeedbackProps;

const maxFutureFeedbacksAllowed = 1;

export const useFeedbackPropsLoop = () => {
    const currentTime = useBattleSelector(battle => battle.currentTime);
    const spellActionEffectList = useBattleSelector(battle => battle.spellActionEffectList);

    return (fn: FeedbackPropsLoopFn) => {

        let startedSpell = false;
        let nbrFutureFeedbacks = 0;

        return spellActionEffectList.reduce<BattleFeedbackProps>((acc, startTime) => {
            const isPresent = !startedSpell && startTime > currentTime;
            if (isPresent) {
                startedSpell = true;
            }

            const getPeriod = (): FeedbackPropsLoopPeriod => {
                if (isPresent) {
                    return 'present';
                }

                if (!startedSpell) {
                    return 'past';
                }

                return 'future';
            };

            const period = getPeriod();

            if (period === 'future') {
                nbrFutureFeedbacks++;
                if (nbrFutureFeedbacks > maxFutureFeedbacksAllowed) {
                    return acc;
                }
            }

            return fn(acc, startTime, period);
        }, {});
    };
};
