import { getSpellCategory } from '@timeflies/common';
import { TimeGaugePanelProps } from '@timeflies/time-gauge-panel';
import { currentEntitiesSelector } from '../../hooks/use-entities';
import { useIsMyCharacterPlaying } from '../../hooks/use-is-my-character-playing';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useTimeGaugePanelProps = (): TimeGaugePanelProps => {
    const isMyCharacterPlaying = useIsMyCharacterPlaying();
    const startTime = useBattleSelector(battle => battle.turnStartTime);
    const duration = useBattleSelector(battle => battle.playingCharacterId ? currentEntitiesSelector(battle).characters.actionTime[ battle.playingCharacterId ] : 0);
    const staticSpells = useBattleSelector(battle => battle.staticSpells);
    const spellActionEffectList = useBattleSelector(battle => battle.spellActionEffectList);
    const spellActionEffects = useBattleSelector(battle => battle.spellActionEffects);

    if (!isMyCharacterPlaying) {
        return {
            startTime: 0,
            duration: 0,
            spellDurationList: []
        };
    }

    const spellDurationList = spellActionEffectList.map((startTime): TimeGaugePanelProps[ 'spellDurationList' ][ number ] => {
        const { spellId, duration } = spellActionEffects[ startTime ].spellAction;

        return {
            startTime,
            duration,
            spellCategory: getSpellCategory(staticSpells[ spellId ].spellRole)
        };
    });

    return {
        startTime,
        duration,
        spellDurationList
    };
};
