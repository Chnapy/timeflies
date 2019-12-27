import { BattleScene } from '../scenes/BattleScene';
import { StateManager, StateMap } from './StateManager';
import { StateManagerIdle } from './StateManagerIdle';
import { StateManagerMoving } from './StateManagerMoving';
import { StateManagerWatch } from './StateManagerWatch';
import { StateManagerSortPrepare } from './StateManagerSortPrepare';
import { StateManagerSortLaunch } from './StateManagerSortLaunch';

export function getFromState(scene: BattleScene, stateObject: StateMap): StateManager<any> {
    switch (stateObject.state) {
        case 'idle':
            return new StateManagerIdle(scene, stateObject.data);
        case 'move':
            return new StateManagerMoving(scene, stateObject.data);
        case 'watch':
            return new StateManagerWatch(scene, stateObject.data);
        case 'sortPrepare':
            return new StateManagerSortPrepare(scene, stateObject.data);
        case 'sortLaunch':
            return new StateManagerSortLaunch(scene, stateObject.data);
    }
}