import { Action } from 'redux';
import { BattleSceneAction } from '../phaser/battleReducers/BattleReducerManager';
import { LoadAction } from '../stages/load/LoadScene';
import { MessageAction } from '../socket/WSClient';
import { LoginSuccess } from '../ui/reducers/CurrentPlayerReducer';
import { SpellEngineBindAction } from '../stages/battle/engine/Engine';
import { BStateEventAction } from '../stages/battle/battleState/BStateMachine';
import { BattleSpellLaunchAction } from '../stages/battle/spellAction/SpellActionManager';
import { BattleCommitAction } from '../stages/battle/snapshot/SnapshotManager';

export type IGameAction<T extends string, G extends boolean = false> = Action<T>
    & (G extends true ? {
        onlyGame: true;
    } : {
        onlyGame?: never;
    });

export type GameAction =
    | MessageAction
    | LoadAction
    | BattleSceneAction
    | LoginSuccess
    | SpellEngineBindAction
    | BStateEventAction
    | BattleSpellLaunchAction
    | BattleCommitAction;
