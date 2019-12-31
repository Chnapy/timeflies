import { Controller } from '../../Controller';
import { BattleCharAction, BattleStateAction } from '../battleReducers/BattleReducerManager';
import { CharAction } from '../cycle/CycleManager';
import { BattleRoomManager, ConfirmReceive } from '../room/BattleRoomManager';
import { BattleStateManager } from './BattleStateManager';

export class BattleStateManagerSpellLaunch extends BattleStateManager<'spellLaunch'> {

    init(): void {
        const { spell, position } = this.stateData;
        const { characters } = this.battleData;

        const target = characters.find(c => c.position.x === position.x && c.position.y === position.y);
        if (target) {
            target.life -= spell.attaque;
        }

        const charAction: CharAction = {
            startTime: Date.now(),
            spell,
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
        }, spell.time);
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
