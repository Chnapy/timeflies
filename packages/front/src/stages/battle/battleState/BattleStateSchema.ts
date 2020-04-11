import { SpellType } from '@timeflies/shared';
import { IGameAction } from '../../../action/GameAction';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { EngineCreator } from '../engine/Engine';
import { SpellPrepareEngine } from '../engine/SpellPrepareEngine';
import { WatchEngine } from '../engine/WatchEngine';
import { SpellAction } from '../spellAction/SpellActionManager';


export type BState = 'watch' | 'spellPrepare';

interface BStateActionAbstract<E extends string, P = {}> extends IGameAction<'battle/state/event'> {
    eventType: E;
    payload: P;
}

export interface BStateResetAction extends BStateActionAbstract<'RESET', {
    characterId: string
}> { }
export interface BStateTurnStartAction extends BStateActionAbstract<'TURN-START', {
    characterId: string;
}> { }
export interface BStateTurnEndAction extends BStateActionAbstract<'TURN-END'> { }
export interface BStateSpellPrepareAction extends BStateActionAbstract<'SPELL-PREPARE', {
    spellType: SpellType;
}> { }
export interface BStateSpellLaunchAction extends BStateActionAbstract<'SPELL-LAUNCH', {
    spellActions: SpellAction[];
}> { }

export type BStateAction =
    | BStateResetAction
    | BStateTurnStartAction
    | BStateTurnEndAction
    | BStateSpellPrepareAction
    | BStateSpellLaunchAction;

export type BStateActionType = BStateAction[ 'eventType' ];

export interface BStateSchemaTrigger<E extends BStateActionType> {
    target: PickBStateFromEvent<E>;
    cond?: () => boolean;
};

type ParamOfStateEngineCreator<S extends BState> = BStateEngineCreator<S> extends EngineCreator<infer E, any>
    ? E
    : never;

type PickBStateFromEvent<E extends BStateActionType> = {
    [ S in BState ]: ParamOfStateEngineCreator<S> extends BStateActionAbstract<infer T, any>
    ? (E extends T ? S : never)
    : (Extract<ParamOfStateEngineCreator<S>, undefined> extends undefined ? S : never);

}[ BState ];

export interface BStateSchema<S extends BState> {
    engineCreator: BStateEngineCreator<S>;
    on?: {
        [ E in BStateActionType ]?: BStateSchemaTrigger<E>[];
    };
}

export interface BStateSchemaRoot {
    initialState: PickBStateFromEvent<never>;
    states: {
        [ S in BState ]: BStateSchema<S>;
    };
}

type BStateEngineCreator<S extends BState> = {
    watch: typeof WatchEngine;
    spellPrepare: typeof SpellPrepareEngine;
}[ S ];

export type BStateEngine = ReturnType<BStateEngineCreator<BState>>;

type Dependencies = {
    [ S in BState ]: BStateEngineCreator<S>;
};

export const BStateSchemaRoot = (
    {
        spellPrepare: spellPrepareCreator,
        watch: watchCreator
    }: Dependencies = {
            spellPrepare: SpellPrepareEngine,
            watch: WatchEngine
        }
): BStateSchemaRoot => {

    const shouldBeOwnTurn = (): boolean => {
        const { globalTurn } = serviceBattleData('cycle');

        return !!globalTurn?.currentTurn.character.isMine
    };
    const shouldNotBeOwnTurn = (): boolean => !shouldBeOwnTurn();

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
            } ]
        }
    };

    const spellPrepare: BStateSchema<'spellPrepare'> = {
        engineCreator: spellPrepareCreator,
        on: {
            RESET,
            'TURN-END': [
                {
                    target: 'watch',
                    // cond: shouldBeOwnTurn
                }
            ],
            'SPELL-LAUNCH': [ {
                target: 'spellPrepare'
            } ],
            'SPELL-PREPARE': [{
                target: 'spellPrepare'
            }]
        }
    };

    return {
        initialState: 'watch',
        states: {
            watch,
            spellPrepare,
        }
    };
}
