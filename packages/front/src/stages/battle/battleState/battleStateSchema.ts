import { BattleData } from "../../../BattleData";


export type BState = 'watch' | 'idle' | 'spellPrepare' | 'spellLaunch';

export type BStateEvents = 'RESET'
    | 'TURN-START' | 'TURN-END'
    | 'SPELL-PREPARE' | 'SPELL-LAUNCH' | 'SPELL-NOTIFY';

export interface BStateSchemaTrigger<S extends BState = BState> {
    target: S;
    cond?: () => boolean;
};

export interface BStateSchema<S extends BState> {
    on?: {
        [ E in BStateEvents ]?: BStateSchemaTrigger<S>[];
    };
}

type BStateSchemaWrapper<S extends BState> = {
    [ K in S ]: BStateSchema<Exclude<BState, K>>;
};

export interface BStateSchemaRoot {
    initialState: BState;
    states: Required<BStateSchemaWrapper<BState>>;
}

export const battleStateSchema = (battleData: BattleData): BStateSchemaRoot => {

    const shouldBeOwnTurn = (): boolean => !!battleData.globalTurn?.currentTurn.character.isMine;
    const shouldNotBeOwnTurn = (): boolean => !shouldBeOwnTurn();
    const shouldTurnBeRunning = (): boolean => battleData.globalTurn?.currentTurn.state === 'running';

    const RESET: BStateSchemaTrigger<any>[] = [ {
        target: 'watch',
        cond: shouldNotBeOwnTurn
    }, {
        target: 'idle',
        cond: shouldBeOwnTurn
    } ];

    const watchState: BStateSchemaWrapper<'watch'> = {
        watch: {

            on: {
                'TURN-START': [ {
                    target: 'idle',
                    cond: shouldBeOwnTurn
                } ],
                'SPELL-NOTIFY': [ {
                    target: 'spellLaunch',
                    cond: () => shouldNotBeOwnTurn() && shouldTurnBeRunning()
                } ]
            }
        }
    };

    const idleState: BStateSchemaWrapper<'idle'> = {
        idle: {

            on: {
                'SPELL-PREPARE': [ {
                    target: 'spellPrepare'
                } ],
                'TURN-END': [ {
                    target: 'watch'
                } ]
            }
        }
    };

    const spellPrepareState: BStateSchemaWrapper<'spellPrepare'> = {
        spellPrepare: {

            on: {
                RESET,
                'SPELL-LAUNCH': [ {
                    target: 'spellLaunch'
                } ]
            }
        }
    };

    const spellLaunchState: BStateSchemaWrapper<'spellLaunch'> = {
        spellLaunch: {

            on: {
                RESET
            }
        }
    };

    return {
        initialState: 'watch',
        states: {
            ...watchState,
            ...idleState,
            ...spellPrepareState,
            ...spellLaunchState
        }
    };
}
