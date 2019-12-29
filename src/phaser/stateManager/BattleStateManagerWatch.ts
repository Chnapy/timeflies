import { BattleStateManager, BattleStateData } from './BattleStateManager';
import { BattleScene } from '../scenes/BattleScene';

export class BattleStateManagerWatch extends BattleStateManager<'watch'> {

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
    }

    onTurnEnd(): void {
    }
}
