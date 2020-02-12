import { Action } from 'redux';
import { BattleSceneAction } from '../phaser/battleReducers/BattleReducerManager';
import { LoadAction } from '../phaser/scenes/LoadScene';
import { MessageAction } from '../socket/WSClient';

export type IGameAction<T extends string, G extends boolean = false> = Action<T>
    & (G extends true ? {
        onlyGame: true;
    } : {
        onlyGame?: never;
    });

export type GameAction =
    | MessageAction
    | LoadAction
    | BattleSceneAction;
