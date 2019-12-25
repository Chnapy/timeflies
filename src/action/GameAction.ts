import { Action } from 'redux';
import { BattleSceneAction } from '../phaser/scenes/BattleScene';
import { CycleAction } from '../phaser/cycle/Cycle';

export type IGameAction<T extends string, G extends boolean = false> = Action<T>
    & (G extends true ? {
        onlyGame: true;
    } : {
        onlyGame?: never;
    });

export type GameAction =
    | BattleSceneAction
    | CycleAction;
    