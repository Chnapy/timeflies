import { Action } from "redux";
import { serviceBattleData } from '../../../services/serviceBattleData';
import { EngineCreator } from '../engine/Engine';
import { SpellPrepareEngine } from '../engine/SpellPrepareEngine';


export type BState = 'watch' | 'spellPrepare'// | 'spellLaunch';

interface BStateEventAbstract<S extends string, P = {}> extends Action<S> {
    payload: P;
}

export interface BStateResetEvent extends BStateEventAbstract<'RESET', {
    characterId: string
}> { }
export interface BStateTurnStartEvent extends BStateEventAbstract<'TURN-START', {
    characterId: string;
}> { }
export interface BStateTurnEndEvent extends BStateEventAbstract<'TURN-END'> { }
export interface BStateSpellPrepareEvent extends BStateEventAbstract<'SPELL-PREPARE', {
    spellId: string;
}> { }
// export interface BStateSpellLaunchEvent extends BStateEventAbstract<'SPELL-LAUNCH', {
//     spellId: string;
//     positions: Position[];
// }> { }
// export interface BStateSpellNotifyEvent extends BStateEventAbstract<'SPELL-NOTIFY', {
//     spellId: string;
//     positions: Position[];
// }> { }

export type BStateEvent =
    | BStateResetEvent
    | BStateTurnStartEvent
    | BStateTurnEndEvent
    | BStateSpellPrepareEvent
    // | BStateSpellLaunchEvent
    // | BStateSpellNotifyEvent;

export type BStateEventType = BStateEvent[ 'type' ];

export interface BStateSchemaTrigger<E extends BStateEventType> {
    target: PickBStateFromEvent<E>;
    cond?: () => boolean;
};

type ParamOfStateEngineCreator<S extends BState> = BStateEngineCreator<S> extends EngineCreator<infer E, any>
    ? E
    : never;

// Parameters<BStateEngineCreator<S>>[0]['event'];

type PickBStateFromEvent<E extends BStateEventType> = {
    [ S in BState ]: ParamOfStateEngineCreator<S> extends Action<infer T>
    ? (E extends T ? S : never)
    : (Extract<ParamOfStateEngineCreator<S>, undefined> extends undefined ? S : never);

}[ BState ];

export interface BStateSchema<S extends BState> {
    engineCreator: BStateEngineCreator<S>;
    on?: {
        [ E in BStateEventType ]?: BStateSchemaTrigger<E>[];
    };
}

export interface BStateSchemaRoot {
    initialState: PickBStateFromEvent<never>;
    states: {
        [ S in BState ]: BStateSchema<S>;
    };
}

type BStateEngineCreator<S extends BState> = {
    watch: EngineCreator<undefined, any>;
    // idle: (e: BStateResetEvent | BStateTurnStartEvent) => {};
    spellPrepare: typeof SpellPrepareEngine;
    // spellLaunch: EngineCreator<any, any>;
}[ S ];

export type BStateEngine = ReturnType<BStateEngineCreator<BState>>;

type Dependencies = {
    [ S in BState ]: BStateEngineCreator<S>;
};

export const BStateSchemaRoot = (
    {
        // idle: idleCreator,
        spellPrepare: spellPrepareCreator,
        // spellLaunch: spellLaunchCreator,
        watch: watchCreator
    }: Dependencies = {
            // idle: () => ({}),
            spellPrepare: SpellPrepareEngine,
            // spellLaunch: () => ({}),
            watch: () => ({})
        }
): BStateSchemaRoot => {

    const { globalTurn } = serviceBattleData('cycle');

    const shouldBeOwnTurn = (): boolean => !!globalTurn?.currentTurn.character.isMine;
    const shouldNotBeOwnTurn = (): boolean => !shouldBeOwnTurn();
    // const shouldTurnBeRunning = (): boolean => globalTurn?.currentTurn.state === 'running';

    const RESET: BStateSchemaTrigger<'RESET'>[] = [ {
        target: 'watch',
        cond: shouldNotBeOwnTurn
    }, {
        target: 'spellPrepare',
        cond: shouldBeOwnTurn
    } ];

    const watch: BStateSchema<'watch'> = {
        engineCreator: watchCreator,
        on: {
            'TURN-START': [ {
                target: 'spellPrepare',
                cond: shouldBeOwnTurn
            } ],
            // 'SPELL-NOTIFY': [ {
            //     target: 'spellLaunch',
            //     cond: () => shouldNotBeOwnTurn() && shouldTurnBeRunning()
            // } ]
        }
    };

    // const idle: BStateSchema<'idle'> = {
    //     engineCreator: idleCreator,
    //     on: {
    //         'SPELL-PREPARE': [{
    //             target: 'spellPrepare'
    //         }],
    //         'TURN-END': [{
    //             target: 'watch'
    //         }]
    //     }
    // };

    const spellPrepare: BStateSchema<'spellPrepare'> = {
        engineCreator: spellPrepareCreator,
        on: {
            RESET,
            // 'SPELL-LAUNCH': [ {
            //     target: 'spellLaunch'
            // } ]
        }
    };

    // const spellLaunch: BStateSchema<'spellLaunch'> = {
    //     engineCreator: spellLaunchCreator,
    //     on: {
    //         RESET
    //     }
    // };

    return {
        initialState: 'watch',
        states: {
            watch,
            // idle,
            spellPrepare,
            // spellLaunch
        }
    };
}
