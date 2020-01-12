import { BattleData } from "../phaser/scenes/BattleScene";
import { BattleLoadPayload } from '@shared/BattleLoadPayload';

type NarrowState<T, N> = T extends { state: N } ? T : never;

export interface UIStateBoot {
    state: 'boot';
}

export interface UIStateLoad {
    state: 'load';
    payload: BattleLoadPayload;
}

export interface UIStateBattle {
    state: 'battle';
    battleData: BattleData;
}

export type UIStateData = UIStateBoot | UIStateLoad | UIStateBattle;

export interface UIState<D extends UIStateData['state'] = UIStateData['state']> {

    data: NarrowState<UIStateData, D>;

}
