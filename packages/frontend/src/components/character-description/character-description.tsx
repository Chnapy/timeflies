import { CharacterRole } from '@timeflies/common';

const characterDescriptionMap: { [ characterRole in CharacterRole ]: string } = {
    'tacka': 'Standard character for melee attack & heal.',
    'vemo': 'Placement character specialized in map-control.',
    'meti': 'Support character playing with time.'
};

type CharacterDescriptionProps = {
    characterRole: CharacterRole;
};

export const CharacterDescription: React.FC<CharacterDescriptionProps> = ({ characterRole }) => (
    <>{characterDescriptionMap[ characterRole ]}</>
);
