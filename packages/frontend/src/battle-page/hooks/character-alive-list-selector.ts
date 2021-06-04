import { CharacterId, CharacterUtils, ObjectTyped, SerializableState } from '@timeflies/common';
import { createSelector } from 'reselect';

const getCharacterListByHealth = ({ characters }: SerializableState, select: (health: number) => boolean) => {
    const characterAliveList = ObjectTyped.entries(characters.health)
        .filter(([ characterId, health ]) => select(health))
        .map(([ characterId ]) => characterId);

    return JSON.stringify(characterAliveList);
};

const getSerializedCharacterAliveList = (state: SerializableState) => getCharacterListByHealth(state, CharacterUtils.isAlive);

const getSerializedCharacterDeadList = (state: SerializableState) => getCharacterListByHealth(state, health => !CharacterUtils.isAlive(health));

const getParsedCharacterList = (serializedCharacterList: string): CharacterId[] => JSON.parse(serializedCharacterList);

export const characterAliveListSelector = createSelector(
    [ getSerializedCharacterAliveList ],
    getParsedCharacterList
);

export const characterDeadListSelector = createSelector(
    [ getSerializedCharacterDeadList ],
    getParsedCharacterList
);
