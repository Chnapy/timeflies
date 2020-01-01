import { BattleStateManager } from './BattleStateManager';

export class BattleStateManagerWatch extends BattleStateManager<'watch'> {

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
    }

    onTurnEnd(): void {
    }
}
