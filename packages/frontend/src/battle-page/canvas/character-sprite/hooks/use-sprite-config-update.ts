import { CharacterId, getOrientationFromTo, getSpellCategory, SpellRole } from '@timeflies/common';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import React from 'react';
import { useCurrentEntities } from '../../../hooks/use-entities';
import { useBattleSelector } from '../../../store/hooks/use-battle-selector';
import { isMoveState, useSpriteMoveUpdateTicker } from './use-sprite-move-update-ticker';

const isAttackState = (spellRole: SpellRole | null) => spellRole && getSpellCategory(spellRole) === 'offensive';

export const useSpriteConfigUpdate = (characterId: CharacterId): SpritesheetsUtils.CharacterSpriteConfig => {
    const { characterRole } = useBattleSelector(battle => battle.staticCharacters[ characterId ]);
    const position = useCurrentEntities(({ characters }) => characters.position[ characterId ]);
    const spellActionEffect = useBattleSelector(({ currentTime, spellActionEffectList, spellActionEffects }) => {
        const startTime = spellActionEffectList.find(startTime => startTime > currentTime);
        if (!startTime) {
            return null;
        }

        return spellActionEffects[ startTime ];
    });

    const isActing = useBattleSelector(battle => spellActionEffect
        ? battle.staticSpells[ spellActionEffect.spellAction.spellId ].characterId === characterId
        : false);
    const spellRole = useBattleSelector(battle => spellActionEffect && isActing
        ? battle.staticSpells[ spellActionEffect.spellAction.spellId ].spellRole
        : null);

    const isTargeted = spellActionEffect && !isActing && spellActionEffect.spellEffect.actionArea.some(p => p.id === position.id);

    const finalOrientation = useCurrentEntities(({ characters }) => {
        if (isAttackState(spellRole)) {
            const nextOrientation = (spellActionEffect?.spellEffect.characters ?? {})[ characterId ]?.orientation;
            if (nextOrientation) {
                return nextOrientation;
            }
        }

        return characters.orientation[ characterId ];
    });

    const [ tempOrientation, setTempOrientation ] = React.useState(finalOrientation);

    const moveState = isMoveState(spellRole);

    const getState = (): SpritesheetsUtils.CharacterSpriteState => {
        if (isTargeted) {
            return 'hit';
        }

        if (moveState) {
            return 'walk';
        }

        if (isAttackState(spellRole)) {
            return 'attack';
        }

        return 'idle';
    };

    useSpriteMoveUpdateTicker(
        characterId,
        React.useCallback((prevPos, nextPos) => {
            setTempOrientation(getOrientationFromTo(prevPos, nextPos));
        }, [ setTempOrientation ])
    );

    const role = characterRole;
    const orientation = moveState ? tempOrientation : finalOrientation;
    const state = getState();

    return React.useMemo((): SpritesheetsUtils.CharacterSpriteConfig => ({
        role, orientation, state
    }), [ role, orientation, state ]);
};
