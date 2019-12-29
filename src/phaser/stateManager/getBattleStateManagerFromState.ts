import { BattleScene, BattleData } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateMap } from './BattleStateManager';
import { BattleStateManagerIdle } from './BattleStateManagerIdle';
import { BattleStateManagerMoving } from './BattleStateManagerMoving';
import { BattleStateManagerWatch } from './BattleStateManagerWatch';
import { BattleStateManagerSpellPrepare } from './BattleStateManagerSpellPrepare';
import { BattleStateManagerSpellLaunch } from './BattleStateManagerSpellLaunch';

export function getBattleStateManagerFromState(scene: BattleScene, battleData: BattleData, stateObject: BattleStateMap): BattleStateManager<any> {
    switch (stateObject.state) {
        case 'idle':
            return new BattleStateManagerIdle(scene, battleData, stateObject.data);
        case 'move':
            return new BattleStateManagerMoving(scene, battleData, stateObject.data);
        case 'watch':
            return new BattleStateManagerWatch(scene, battleData, stateObject.data);
        case 'spellPrepare':
            return new BattleStateManagerSpellPrepare(scene, battleData, stateObject.data);
        case 'spellLaunch':
            return new BattleStateManagerSpellLaunch(scene, battleData, stateObject.data);
    }
}