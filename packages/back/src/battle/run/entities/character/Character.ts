import { CharacterFeatures, CharacterRoom, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { Immutable } from 'immer';

export type Character = {
    id: string;
    staticData: Readonly<StaticCharacter>;
    position: Readonly<Position>;
    orientation: Orientation;
    features: CharacterFeatures;

    playerId: string;
};

export const characterToSnapshot = ({ id, staticData, position, orientation, features, playerId }: Immutable<Character>): CharacterSnapshot => ({
    id,
    staticData: staticData as StaticCharacter,
    position: { ...position },
    orientation,
    features: { ...features },
    playerId
});

export const characterAlterLife = ({ features }: Character, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: Immutable<Character>) => character.features.life > 0;

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
