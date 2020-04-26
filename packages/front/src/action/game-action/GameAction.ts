import { Action } from 'redux';
import { BattleAction } from './battle-action';
import { RoomAction } from './room-action';

export type IGameAction<T extends string> = Action<T>;

export type GameAction =
    | RoomAction
    | BattleAction;
