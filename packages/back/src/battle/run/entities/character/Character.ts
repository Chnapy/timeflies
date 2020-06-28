import { CharacterEntity, CharacterRoom, StaticCharacter } from '@timeflies/shared';

// should not use entity directly, for future updates
export type Character = CharacterEntity;

export const Character = (
    { id, position }: Pick<CharacterRoom, 'id' | 'position'>,
    staticData: StaticCharacter,
    playerId: string,
): Character => {

    return {
        id,
        staticData,
        position,
        orientation: 'bottom', // should be calculated (?)
        features: { ...staticData.initialFeatures },
        playerId
    };
};
