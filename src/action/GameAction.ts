import { Action } from 'redux';
import { BattleSceneAction } from '../phaser/battleReducers/BattleReducerManager';

export type IGameAction<T extends string, G extends boolean = false> = Action<T>
    & (G extends true ? {
        onlyGame: true;
    } : {
        onlyGame?: never;
    });

export type GameAction =
    | BattleSceneAction;
    