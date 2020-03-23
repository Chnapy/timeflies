import { BattleLoadPayload } from '@timeflies/shared';
import { BattleDataMap } from "../BattleData";
import { CurrentPlayer } from "../CurrentPlayer";

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
    battleData: BattleDataMap;
}

export type UIStateData = UIStateBoot | UIStateLoad | UIStateBattle;

export interface UIState<D extends UIStateData['state'] = UIStateData['state']> {

    currentPlayer: CurrentPlayer | null;

    data: NarrowState<UIStateData, D>;

}
