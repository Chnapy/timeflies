import { BattleData } from "../../../BattleData";
import { BStateSchema, BState, BStateEvent, BStateSchemaTrigger, BStateEngine } from './BattleStateSchema';

export interface BStateMachine {
    state: BState;
    send(event: BStateEvent): boolean;
}

interface Dependencies {
    battleStateSchemaCreator: typeof BStateSchema;
}

export const BStateMachine = (
    battleData: BattleData,
    { battleStateSchemaCreator }: Dependencies = { battleStateSchemaCreator: BStateSchema }
): BStateMachine => {

    const schema = battleStateSchemaCreator(battleData);

    let state: BState = schema.initialState;
    let engine: BStateEngine = schema.states[schema.initialState].engineCreator();

    return {
        get state() {
            return state;
        },
        send(event: BStateEvent): boolean {
            const stateSchema = schema.states[state];

            const triggers: BStateSchemaTrigger<any>[] = (stateSchema.on && stateSchema.on[event.type]) || [];

            const trigger = triggers.find(t => !t.cond || t.cond());
            if (trigger) {

                // previous engine end

                state = trigger.target;
                const { engineCreator } = schema.states[state];
                engine = engineCreator(event as any);
                return true;
            }
            return false;
        }
    };
};
