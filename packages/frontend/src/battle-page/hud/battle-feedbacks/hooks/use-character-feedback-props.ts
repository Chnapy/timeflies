import { TimeFullProps, TimePartialProps } from '@timeflies/app-ui';
import { BattleFeedbackProps, FeedbackEffectsInfos } from '@timeflies/battle-feedback';
import { CharacterId } from '@timeflies/common';
import { useActionPreviewContext } from '../../../action-preview/view/action-preview-context';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { useFeedbackPropsLoop } from './use-feedback-props-loop';

export const useCharacterFeedbackProps = (characterId: CharacterId) => {
    const characterPosition = useCurrentEntities(entities => entities.characters.position[ characterId ]);

    const isPlaying = useBattleSelector(battle => battle.playingCharacterId === characterId);
    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const playingCharacterActionTime = useCurrentEntities(entities => entities.characters.actionTime[ characterId ]);

    const staticSpells = useBattleSelector(battle => battle.staticSpells);

    const spellActionEffects = useBattleSelector(battle => battle.spellActionEffects);

    const selectedSpellRole = useBattleSelector(battle => battle.selectedSpellId
        ? battle.staticSpells[ battle.selectedSpellId ].spellRole
        : null);
    const { spellEffectPreview } = useActionPreviewContext();

    const feedbackPropsLoop = useFeedbackPropsLoop();

    const feedbackProps = feedbackPropsLoop((acc, startTime, period) => {
        const { spellAction, spellEffect } = spellActionEffects[ startTime ];

        const { targetPos, duration, spellId } = spellAction;
        const { characters = {} } = spellEffect;

        const isTargeting = characterPosition.id === targetPos.id;
        const characterVariables = characters[ characterId ];

        const spellRole = staticSpells[ spellId ].spellRole;

        const getCurrentFeedbackEffect = (): FeedbackEffectsInfos<TimeFullProps> | undefined => {
            if (period !== 'present' || (!characterVariables && !isTargeting)) {
                return undefined;
            }

            const effect: FeedbackEffectsInfos<TimeFullProps> = { spellRole };

            if (characterVariables) {
                effect.variables = { ...characterVariables };
            }

            if (isTargeting) {
                effect.spellInfos = { startTime, duration };
            }

            return effect;
        };

        const getFutureFeedbackEffect = (): FeedbackEffectsInfos<TimePartialProps>[] => {
            if (period !== 'future' || (!characterVariables && !isTargeting)) {
                return [];
            }

            const effect: FeedbackEffectsInfos<TimePartialProps> = { spellRole };

            if (characterVariables) {
                effect.variables = { ...characterVariables };
            }

            if (isTargeting) {
                effect.spellInfos = { duration };
            }

            return [ effect ];
        };

        acc.currentEffects = getCurrentFeedbackEffect();
        acc.futureEffects = [
            ...acc.futureEffects ?? [],
            ...getFutureFeedbackEffect()
        ];

        return acc;
    });

    const getFeedbackTurnInfos = (): BattleFeedbackProps[ 'turnInfos' ] => {
        if (!isPlaying) {
            return undefined;
        }

        return {
            startTime: turnStartTime,
            duration: playingCharacterActionTime
        };
    };

    feedbackProps.turnInfos = getFeedbackTurnInfos();

    const { characters = {} } = spellEffectPreview;

    if (selectedSpellRole && characters[ characterId ]) {
        feedbackProps.previewEffects = {
            spellRole: selectedSpellRole,
            spellInfos: {
                duration: spellEffectPreview.duration
            },
            variables: { ...characters[ characterId ] }
        };
    }

    return Object.keys(feedbackProps).length === 0
        ? null
        : feedbackProps;
};
