import { BattleData, BattleRoomState } from "../phaser/scenes/BattleScene";

type NarrowState<T, N> = T extends { state: N } ? T : never;

export interface UIStateBoot {
    state: 'boot';
}

export interface UIStateLoad {
    state: 'load';
    battleRoomState: BattleRoomState;
}

export interface UIStateBattle {
    state: 'battle';
    battleData: BattleData;
}

export type UIStateData = UIStateBoot | UIStateLoad | UIStateBattle;

export interface UIState<D extends UIStateData['state'] = UIStateData['state']> {

    data: NarrowState<UIStateData, D>;

}
