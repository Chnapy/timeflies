import { BattleData } from '../phaser/scenes/BattleScene';
import { BStateSchemaRoot, battleStateSchema, BState, BStateEvents, BStateSchemaTrigger } from './battleStateSchema';


export class BStateMachine {

    private _state: BState;
    get state(): BState {
        return this._state;
    }

    private readonly schema: BStateSchemaRoot;

    constructor(battleData: BattleData) {
        this.schema = battleStateSchema(battleData);
        this._state = this.schema.initialState;
    }

    send(event: BStateEvents): boolean {
        const stateSchema = this.schema.states[ this.state ];

        const triggers: BStateSchemaTrigger[] = stateSchema.on && stateSchema.on[ event ] || [];

        const trigger = triggers.find(t => !t.cond || t.cond());
        if (trigger) {
            this._state = trigger.target;
            return true;
        }
        return false;
    }
}
