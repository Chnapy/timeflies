import { Controller } from '../../Controller';
import { BattleCharAction, BattleRollbackAction } from '../battleReducers/BattleReducerManager';
import { CharAction } from '../cycle/CycleManager';
import { BattleRoomManager, ConfirmReceive } from '../room/BattleRoomManager';
import { BattleStateManager } from './BattleStateManager';

export class BattleStateManagerSpellLaunch extends BattleStateManager<'spellLaunch'> {

    init(): void {
        const { spell, positions } = this.stateData;

        const charAction: CharAction = {
            startTime: Date.now(),
            spell,
            positions
        };

        Controller.dispatch<BattleCharAction>({
            type: 'battle/charAction',
            charAction
        });

        BattleRoomManager.mockResponse<ConfirmReceive>(1000, {
            type: 'confirm',
            isOk: true
        }, 'last');
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }

    onTurnEnd(): void {
        const { spell } = this.stateData;

        spell.spellAct.cancel();

        Controller.dispatch<BattleRollbackAction>({
            type: 'battle/rollback',
            config: {
                by: 'last'
            }
        });
    }
}
