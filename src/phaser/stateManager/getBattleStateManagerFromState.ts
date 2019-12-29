import { BattleScene } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateMap } from './BattleStateManager';
import { BattleStateManagerIdle } from './BattleStateManagerIdle';
import { BattleStateManagerMoving } from './BattleStateManagerMoving';
import { BattleStateManagerWatch } from './BattleStateManagerWatch';
import { BattleStateManagerSortPrepare } from './BattleStateManagerSortPrepare';
import { BattleStateManagerSortLaunch } from './BattleStateManagerSortLaunch';

export function getBattleStateManagerFromState(scene: BattleScene, stateObject: BattleStateMap): BattleStateManager<any> {
    switch (stateObject.state) {
        case 'idle':
            return new BattleStateManagerIdle(scene, stateObject.data);
        case 'move':
            return new BattleStateManagerMoving(scene, stateObject.data);
        case 'watch':
            return new BattleStateManagerWatch(scene, stateObject.data);
        case 'sortPrepare':
            return new BattleStateManagerSortPrepare(scene, stateObject.data);
        case 'sortLaunch':
            return new BattleStateManagerSortLaunch(scene, stateObject.data);
    }
}