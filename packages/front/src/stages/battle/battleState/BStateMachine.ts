import { serviceEvent } from '../../../services/serviceEvent';
import { MapManager } from '../map/MapManager';
import { BState, BStateAction, BStateEngine, BStateSchemaRoot, BStateSchemaTrigger } from './BattleStateSchema';

export interface BStateMachine {
    state: BState;
}

interface Dependencies {
    battleStateSchemaCreator: typeof BStateSchemaRoot;
}

export const BStateMachine = (
    mapManager: MapManager,
    { battleStateSchemaCreator }: Dependencies = { battleStateSchemaCreator: BStateSchemaRoot }
): BStateMachine => {

    const schema = battleStateSchemaCreator();

    let state: BState = schema.initialState;
    let engine: BStateEngine = schema.states[ schema.initialState ].engineCreator({
        event: undefined,
        deps: {
            mapManager
        }
    });

    const send = (event: BStateAction): void => {
        const stateSchema = schema.states[ state ];
        
        const triggers: BStateSchemaTrigger<any>[] = (stateSchema.on && stateSchema.on[ event.eventType ]) || [];

        const trigger = triggers.find(t => !t.cond || t.cond());
        if (trigger) {

            engine.stop();

            state = trigger.target;
            console.log('state', state);
            const { engineCreator } = schema.states[ state ];
            engine = engineCreator({
                event: event as never,
                deps: {
                    mapManager
                }
            });
        }
    };

    const { onAction } = serviceEvent();

    onAction<BStateAction>('battle/state/event', send);

    return {
        get state() {
            return state;
        }
    };
};
