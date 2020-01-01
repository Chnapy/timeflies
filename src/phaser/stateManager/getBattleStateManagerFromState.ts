import { BattleData, BattleScene } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateMap } from './BattleStateManager';
import { BattleStateManagerIdle } from './BattleStateManagerIdle';
import { BattleStateManagerSpellLaunch } from './BattleStateManagerSpellLaunch';
import { BattleStateManagerSpellPrepare } from './BattleStateManagerSpellPrepare';
import { BattleStateManagerWatch } from './BattleStateManagerWatch';

export function getBattleStateManagerFromState(scene: BattleScene, battleData: BattleData, stateObject: BattleStateMap): BattleStateManager<any> {
    switch (stateObject.state) {
        case 'idle':
            return new BattleStateManagerIdle(scene, battleData, stateObject.data);
        case 'watch':
            return new BattleStateManagerWatch(scene, battleData, stateObject.data);
        case 'spellPrepare':
            return new BattleStateManagerSpellPrepare(scene, battleData, stateObject.data);
        case 'spellLaunch':
            return new BattleStateManagerSpellLaunch(scene, battleData, stateObject.data);
    }
}