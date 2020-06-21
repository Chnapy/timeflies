import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Character<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    isMine: boolean;
    staticData: Readonly<StaticCharacter>;
    position: Readonly<Position>;
    orientation: Orientation;
    features: CharacterFeatures;

    defaultSpellId: string;

    playerId: string;
};

export const characterToSnapshot = ({ id, playerId, staticData, position, orientation, features }: Character<BattleDataPeriod>): CharacterSnapshot => {
    return {
        id,
        playerId,
        staticData: { ...staticData },
        position: { ...position },
        orientation,
        features: { ...features },
    };
};

export const characterAlterLife = ({ features }: Character<BattleDataPeriod>, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: Character<BattleDataPeriod>) => character.features.life > 0;

export const Character = <P extends BattleDataPeriod>(period: P, myPlayerId: string, {
    id, staticData, orientation, position, features, playerId
}: CharacterSnapshot): Character<P> => {

    return {
        id,
        period,
        isMine: playerId === myPlayerId,
        staticData: { ...staticData },
        position: { ...position },
        orientation,
        features: { ...features },
        defaultSpellId: staticData.defaultSpellId,
        playerId
    };
};
