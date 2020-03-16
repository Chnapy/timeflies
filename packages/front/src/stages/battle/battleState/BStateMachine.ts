import { BattleData } from "../../../BattleData";
import { BStateSchemaRoot, BState, BStateEvent, BStateSchemaTrigger, BStateEngine } from './BattleStateSchema';
import { MapManager } from '../map/MapManager';
import { IGameAction } from '../../../action/GameAction';
import { serviceEvent } from '../../../services/serviceEvent';

export interface BStateEventAction extends IGameAction<'battle/state/event'> {
    event: BStateEvent;
}

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

    const send = (event: BStateEvent): void => {
        const stateSchema = schema.states[ state ];

        const triggers: BStateSchemaTrigger<any>[] = (stateSchema.on && stateSchema.on[ event.type ]) || [];

        const trigger = triggers.find(t => !t.cond || t.cond());
        if (trigger) {

            // previous engine end

            state = trigger.target;
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

    onAction<BStateEventAction>('battle/state/event', ({ event }) => send(event));

    return {
        get state() {
            return state;
        }
    };
};
