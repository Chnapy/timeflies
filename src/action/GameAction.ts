import { BattleLaunchAction, BattleStateAction, MoveAction } from '../phaser/scenes/BattleScene';

export type GameAction =
    | BattleLaunchAction
    | MoveAction
    | BattleStateAction;