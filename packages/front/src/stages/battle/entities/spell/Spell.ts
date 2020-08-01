import { cloneByJSON, SpellEntity, SpellSnapshot } from '@timeflies/shared';
import { GameState } from '../../../../game-state';
import { getTurnRemainingTime } from '../../cycle/cycle-reducer';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { playerIsMine } from '../player/Player';

export type Spell<P extends BattleDataPeriod> = SpellEntity & {
    period: P;
};

export const updateSpellFromSnapshot = (spell: Spell<any>, snapshot: SpellSnapshot) => {
    const {
        features
    } = cloneByJSON(snapshot);

    spell.features = features;
};

export type SpellIsUsable =
    | { usable: true; reason?: undefined }
    | { usable: false; reason: 'player' | 'time' };

export const currentSpellIsUsable = (gameState: GameState): SpellIsUsable => {
    const spellId = gameState.battle.battleActionState.selectedSpellId;

    if (!spellId) {
        return {
            usable: false,
            reason: 'player'
        };
    }

    return spellIsUsable(gameState, spellId);
};

export const spellIsUsable = ({ auth, battle }: GameState, spellId: string): SpellIsUsable => {
    const { snapshotState, cycleState } = battle;

    const currentCharacter = snapshotState.battleDataCurrent.characters[ cycleState.currentCharacterId ];

    if (!playerIsMine(auth, currentCharacter.playerId)) {
        return {
            usable: false,
            reason: 'player'
        };
    }

    const spell = snapshotState.battleDataCurrent.spells[ spellId ];

    const remainingTime = getTurnRemainingTime(battle, 'future');

    if (remainingTime < spell.features.duration) {
        return {
            usable: false,
            reason: 'time'
        };
    }

    return { usable: true };
};

export const Spell = <P extends BattleDataPeriod>(period: P, snapshot: SpellSnapshot): Spell<P> => {

    const { index, staticData, features, characterId } = cloneByJSON(snapshot);

    return {
        id: staticData.id,
        period,
        index,
        staticData,
        features,
        characterId
    };
};
