import { Position } from '@timeflies/shared'
import { Controller } from '../../../Controller';
import { BattleSpellLaunchAction } from '../../battleReducers/BattleReducerManager';
import { SpellPrepare } from '../SpellPrepare';

export class SpellPrepareMove extends SpellPrepare<'move'> {

    private pathWorld: Position[] = [];
    private pathTile: Position[] = [];
    private currentTile: Phaser.Tilemaps.Tile | null = null;
    private prevTile: Phaser.Tilemaps.Tile | null = null;

    init(): void {
        this.character.setCharacterState('idle');
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {

        const pos: Position = {
            x: pointer.worldX,
            y: pointer.worldY
        };

        const { map } = this.scene;
        const { decorLayer, pathfinder } = map;

        this.currentTile = decorLayer.getTileAtWorldXY(pos.x, pos.y);
        if (this.currentTile) {

            if (this.prevTile
                && this.currentTile.x === this.prevTile.x && this.currentTile.y === this.prevTile.y) {
                return;
            }

            const mainPos = this.character.position;

            const pathPromise = pathfinder.calculatePath(mainPos.x, mainPos.y, this.currentTile.x, this.currentTile.y);

            pathPromise.promise.then(path => {
                this.pathTile = path;
                this.pathWorld = path.map(p => map.tileToWorldPosition(p, true));
            });

            this.prevTile = this.currentTile;
        }
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
        if (!this.currentTile
            || !this.pathTile.length) {
            return;
        }

        const positions = this.pathTile.slice(1);

        Controller.dispatch<BattleSpellLaunchAction>({
            type: 'battle/spell/launch',
            charAction: {
                state: 'running',
                startTime: Date.now(),
                spell: this.spell,
                duration: this.spell.feature.duration,
                positions
            },
            launchState: positions.length > 1 ? ['first'] : ['first', 'last']
        });
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics) {

        graphics.beginPath();

        graphics.lineStyle(2, 0xff0000, 1);

        this.pathWorld.forEach((p, i) => {
            if (!i) {
                graphics.moveTo(p.x, p.y);
            } else {
                graphics.lineTo(p.x, p.y);
            }
        });

        graphics.strokePath();
    }

    cancel(): void {
    }
}
