import { StateManager, State } from './StateManager';
import { Controller } from '../../Controller';
import { BattleStateAction } from '../scenes/BattleScene';

export class StateManagerSortLaunch extends StateManager<'sortLaunch'> {

    init(): void {
        const { sort, position } = this.stateData;
        const { characters } = this.scene.cycle;

        const target = characters.find(c => c.position.x === position.x && c.position.y === position.y);
        if (target) {
            target.life -= sort.attaque;
        }

        setTimeout(() => {
            Controller.dispatch<BattleStateAction>({
                type: 'battle/state',
                stateObject: {
                    state: 'idle'
                }
            });
        }, 1000);
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }

    onTurnEnd(): void {
    }
}
