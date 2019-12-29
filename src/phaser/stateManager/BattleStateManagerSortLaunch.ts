import { Controller } from '../../Controller';
import { BattleRoomManager, ConfirmReceive } from '../room/BattleRoomManager';
import { BattleScene } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateData } from './BattleStateManager';
import { BattleCharAction, BattleStateAction } from '../battleReducers/BattleReducerManager';
import { CharAction } from '../cycle/CycleManager';

export class BattleStateManagerSortLaunch extends BattleStateManager<'sortLaunch'> {

    constructor(scene: BattleScene, stateData: BattleStateData<'sortLaunch'>) {
        super('sortLaunch', scene, stateData);
    }

    init(): void {
        const { sort, position } = this.stateData;
        const { characters } = this.scene;

        const target = characters.find(c => c.position.x === position.x && c.position.y === position.y);
        if (target) {
            target.life -= sort.attaque;
        }

        const charAction: CharAction = {
            sortId: sort.id,
            position
        };

        Controller.dispatch<BattleCharAction>({
            type: 'battle/charAction',
            charAction
        });

        BattleRoomManager.mockResponse<ConfirmReceive>(1000, {
            type: 'confirm',
            isOk: true
        }, 'last');

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
