import { Position } from '../entities/Character';
import { SpellType } from '../entities/Spell';
import { SpellEngineAbstract } from './SpellEngineAbstract';
import { Controller } from '../../Controller';
import { BattleRollbackAction } from '../battleReducers/BattleReducerManager';

export type SpellResultEnum = 'grid' | 'battleState' | 'charState';

export type SpellResult = Partial<Record<SpellResultEnum, boolean>>;

export abstract class SpellLaunch<T extends SpellType> extends SpellEngineAbstract<'launch', T> {

    abstract async launch(targetPositions: Position[]): Promise<SpellResult>;

    cancel(): void {
        this.beforeCancel();

        Controller.dispatch<BattleRollbackAction>({
            type: 'battle/rollback',
            config: {
                by: 'last'
            }
        });
    }

    protected abstract beforeCancel(): void;
}