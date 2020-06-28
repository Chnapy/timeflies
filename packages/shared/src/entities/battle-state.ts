import { Normalized, denormalize } from '../util/normalize';
import { CharacterEntity, characterEntityToSnapshot } from './Character';
import { SpellEntity, spellEntityToSnapshot } from './Spell';
import { DynamicBattleSnapshot } from '..';

export type BattleStateEntity<C extends CharacterEntity = CharacterEntity, S extends SpellEntity = SpellEntity> = {
    characters: Normalized<C>;
    spells: Normalized<S>;
};

export const battleStateEntityToSnapshot = ({ characters, spells }: BattleStateEntity): Pick<DynamicBattleSnapshot, 'charactersSnapshots' | 'spellsSnapshots'> => {
    return {
        charactersSnapshots: denormalize(characters).map(characterEntityToSnapshot),
        spellsSnapshots: denormalize(spells).map(spellEntityToSnapshot)
    };
};
