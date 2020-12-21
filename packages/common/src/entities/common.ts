import { CharacterVariables } from './character';
import { SpellVariables } from './spell';

export type EntitiesVariables = CharacterVariables & SpellVariables;

export type EntitiesVariablesName = keyof EntitiesVariables;
