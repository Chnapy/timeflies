import { StateManager, State } from './StateManager';
import { Controller } from '../../Controller';
import { BattleStateAction, BattleCharacterPositionAction } from '../scenes/BattleScene';
import { CharAction } from '../entities/CharAction';
import { BattleRoomManager, ConfirmReceive } from '../room/BattleRoomManager';

export class StateManagerSortLaunch extends StateManager<'sortLaunch'> {

    init(): this {
        const { sort, position } = this.stateData;
        const { characters } = this.scene.cycle;

        const target = characters.find(c => c.position.x === position.x && c.position.y === position.y);
        if (target) {
            target.life -= sort.attaque;
        }

        const charAction: CharAction = {
            type: 'sort',
            sortId: sort.id,
            position
        };

        this.scene.cycle.addCharAction(charAction)
            .then(confirm => console.log('success', confirm))
            .catch(confirm => {
                console.log('fail', confirm);

                // reinit old state
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

        return this;
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
