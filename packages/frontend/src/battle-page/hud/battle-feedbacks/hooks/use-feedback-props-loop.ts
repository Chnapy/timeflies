import { BattleFeedbackProps } from '@timeflies/battle-feedback';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';

type FeedbackPropsLoopPeriod = 'past' | 'present' | 'future';

type FeedbackPropsLoopFn = (acc: BattleFeedbackProps, startTime: number, period: FeedbackPropsLoopPeriod) => BattleFeedbackProps;

export const useFeedbackPropsLoop = () => {
    const currentTime = useBattleSelector(battle => battle.currentTime);
    const spellActionEffectList = useBattleSelector(battle => battle.spellActionEffectList);

    return (fn: FeedbackPropsLoopFn) => {

        let startedSpell = false;

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

            return fn(acc, startTime, getPeriod());
        }, {});
    };
};
