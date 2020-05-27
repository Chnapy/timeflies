import { serviceBattleData } from '../../../services/serviceBattleData';
import { SpellPrepareEngine } from '../engine/SpellPrepareEngine';
import { WatchEngine } from '../engine/WatchEngine';
import { BattleStateResetAction, BattleStateSpellLaunchAction, BattleStateSpellPrepareAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from './battle-state-actions';


export type BState = 'watch' | 'spellPrepare';

export interface BStateSchemaTrigger {
    target: BState;
    cond?: () => boolean;
};

export interface BStateSchema<S extends BState> {
    engineCreator: BStateEngineCreator<S>;
    on?: {
        [ E in string ]?: BStateSchemaTrigger[];
    };
}

export interface BStateSchemaRoot {
    initialState: 'watch';
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

    const RESET: BStateSchemaTrigger[] = [ {
        target: 'watch',
        cond: shouldNotBeOwnTurn
    }, {
        target: 'spellPrepare',
        cond: shouldBeOwnTurn
    } ];

    const watch: BStateSchema<'watch'> = {
        engineCreator: watchCreator,
        on: {
            [BattleStateTurnStartAction.type]: [ {
                target: 'spellPrepare',
                cond: shouldBeOwnTurn
            } ]
        }
    };

    const spellPrepare: BStateSchema<'spellPrepare'> = {
        engineCreator: spellPrepareCreator,
        on: {
            [BattleStateResetAction.type]: RESET,
            [BattleStateTurnEndAction.type]: [
                {
                    target: 'watch',
                    // cond: shouldBeOwnTurn
                }
            ],
            [BattleStateSpellLaunchAction.type]: [ {
                target: 'spellPrepare'
            } ],
            [BattleStateSpellPrepareAction.type]: [{
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
