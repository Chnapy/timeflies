import { serviceEvent } from '../../../services/serviceEvent';
import { MapManager } from '../map/MapManager';
import { BattleStateAction, battleStateActionList } from './battle-state-actions';
import { BState, BStateEngine, BStateSchemaRoot, BStateSchemaTrigger } from './BattleStateSchema';

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

    const send = (type: string, payload: BattleStateAction[ 'payload' ]): void => {
        const stateSchema = schema.states[ state ];

        const triggers: BStateSchemaTrigger[] = (stateSchema.on && stateSchema.on[ type ]) || [];

        const trigger = triggers.find(t => !t.cond || t.cond());
        if (trigger) {

            engine.stop();

            state = trigger.target;
            console.log('state', state);
            const { engineCreator } = schema.states[ state ];
            engine = engineCreator({
                event: { type, payload },
                deps: {
                    mapManager
                }
            } as any);
        }
    };

    const { onAction } = serviceEvent();

    battleStateActionList.forEach(battleStateAction => {
        onAction(battleStateAction, payload => send(battleStateAction.type, payload));
    });

    return {
        get state() {
            return state;
        }
    };
};
