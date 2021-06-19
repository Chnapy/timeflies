import { CharacterRole, switchUtil } from '@timeflies/common';

export const CharacterName: React.FC<{ characterRole: CharacterRole }> = ({ characterRole }) => <>
    {switchUtil(characterRole, {
        'tacka': 'Tacka',
        'vemo': 'Vemo',
        'meti': 'Meti'
    })}
</>;
