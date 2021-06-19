import { SpellRole } from '@timeflies/common';
import { spellDescriptionMap } from './spell-description-map';

export const SpellName: React.FC<{ spellRole: SpellRole }> = ({ spellRole }) => <>
    {spellDescriptionMap[ spellRole ].name}
</>;
