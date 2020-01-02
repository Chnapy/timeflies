import { SpellType } from '../entities/Spell';
import { SpellEngineAbstract } from './SpellEngineAbstract';

export abstract class SpellPrepare<T extends SpellType> extends SpellEngineAbstract<'prepare', T> {

    abstract init(): void;
}
