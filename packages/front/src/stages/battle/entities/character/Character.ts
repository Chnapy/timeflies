import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter, cloneByJSON } from '@timeflies/shared';
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

export const updateCharacterFromSnapshot = (character: Character<any>, snapshot: CharacterSnapshot) => {
    const {
        orientation, position, features
    } = cloneByJSON(snapshot);

    character.orientation = orientation;
    character.position = position;
    character.features = features;
};

export const characterAlterLife = ({ features }: Character<BattleDataPeriod>, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: Character<BattleDataPeriod>) => character.features.life > 0;

export const Character = <P extends BattleDataPeriod>(period: P, myPlayerId: string, snapshot: CharacterSnapshot): Character<P> => {

    const {
        id, staticData, orientation, position, features, playerId
    } = cloneByJSON(snapshot);

    return {
        id,
        period,
        isMine: playerId === myPlayerId,
        staticData,
        position,
        orientation,
        features,
        defaultSpellId: staticData.defaultSpellId,
        playerId
    };
};
