import { CharacterEntity, CharacterSnapshot, cloneByJSON } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Character<P extends BattleDataPeriod> = CharacterEntity & {
    period: P;
    isMine: boolean;
    defaultSpellId: string;
};

export const updateCharacterFromSnapshot = (character: Character<any>, snapshot: CharacterSnapshot) => {
    const {
        orientation, position, features
    } = cloneByJSON(snapshot);

    character.orientation = orientation;
    character.position = position;
    character.features = features;
};

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
