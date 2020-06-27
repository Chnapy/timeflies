import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { GameState } from '../../../../game-state';
import { playerIsMine } from '../player/Player';
import { getTurnRemainingTime } from '../../cycle/cycle-reducer';

export type Spell<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    index: number;
    staticData: Readonly<StaticSpell>;
    feature: SpellFeatures;
    characterId: string;
};

export const spellToSnapshot = ({ id, characterId, staticData, index, feature: features }: Spell<BattleDataPeriod>): SpellSnapshot => {
    return {
        id,
        characterId,
        staticData,
        index,
        features
    };
};

export type SpellIsUsable =
    | { usable: true; reason?: undefined }
    | { usable: false; reason: 'player' | 'time' };

export const currentSpellIsUsable = (gameState: GameState): SpellIsUsable => {
    const spellId = gameState.battle.battleActionState.selectedSpellId;

    if(!spellId) {
        return {
            usable: false,
            reason: 'player'
        };
    }

    return spellIsUsable(gameState, spellId);
};

export const spellIsUsable = ({ currentPlayer, battle }: GameState, spellId: string): SpellIsUsable => {
    const { snapshotState, cycleState } = battle;

    const currentCharacter = snapshotState.battleDataCurrent.characters[ cycleState.currentCharacterId ];

    if (!playerIsMine(currentPlayer, currentCharacter.playerId)) {
        return {
            usable: false,
            reason: 'player'
        };
    }

    const spell = snapshotState.battleDataCurrent.spells[ spellId ];

    const remainingTime = getTurnRemainingTime(battle, 'future');

    if (remainingTime < spell.feature.duration) {
        return {
            usable: false,
            reason: 'time'
        };
    }

    return { usable: true };
};

export const Spell = <P extends BattleDataPeriod>(period: P, { index, staticData, features, characterId }: SpellSnapshot): Spell<P> => {

    return {
        id: staticData.id,
        period,
        index,
        staticData,
        feature: features,
        characterId
    };
};
