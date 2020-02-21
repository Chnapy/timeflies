import { BattleData } from "../../../BattleData";
import { BStateSchemaRoot, battleStateSchema, BState, BStateEvents, BStateSchemaTrigger } from './battleStateSchema';

export interface BStateMachine {
    state: BState;
    send(event: BStateEvents): boolean;
}

export const BStateMachine = (battleData: BattleData): BStateMachine => {

    const schema: BStateSchemaRoot = battleStateSchema(battleData);
    let state: BState = schema.initialState;

    return {
        get state() {
            return state;
        },
        send(event: BStateEvents): boolean {
            const stateSchema = schema.states[state];

            const triggers: BStateSchemaTrigger[] = (stateSchema.on && stateSchema.on[event]) || [];

            const trigger = triggers.find(t => !t.cond || t.cond());
            if (trigger) {
                state = trigger.target;
                return true;
            }
            return false;
        }
    };
};
