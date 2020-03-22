import { Action } from 'redux';
import { BattleLaunchAction } from '../phaser/battleReducers/BattleReducerManager';
import { MessageAction } from '../socket/WSClient';
import { BStateAction } from '../stages/battle/battleState/BattleStateSchema';
import { NotifyDeathsAction } from '../stages/battle/cycle/CycleManager';
import { SpellEngineBindAction } from '../stages/battle/engine/Engine';
import { BattleCommitAction } from '../stages/battle/snapshot/SnapshotManager';
import { SpellActionTimerAction } from '../stages/battle/spellAction/SpellActionTimer';
import { LoadAction } from '../stages/load/LoadScene';
import { StageChangeAction } from '../stages/StageManager';
import { LoginSuccess } from '../ui/reducers/CurrentPlayerReducer';

export type IGameAction<T extends string, G extends boolean = false> = Action<T>
    & (G extends true ? {
        onlyGame: true;
    } : {
        onlyGame?: never;
    });

export type GameAction =
    | StageChangeAction<any>
    | MessageAction
    | LoadAction
    | BattleLaunchAction
    | LoginSuccess
    | SpellEngineBindAction
    | BStateAction
    | SpellActionTimerAction
    | BattleCommitAction
    | NotifyDeathsAction;
