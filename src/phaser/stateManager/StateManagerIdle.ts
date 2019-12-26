import { Controller } from '../../Controller';
import { BattleScene, BattleStateAction } from '../scenes/BattleScene';
import { StateData, StateManager } from './StateManager';
import { Position } from '../entities/Character';

export class StateManagerIdle extends StateManager<'idle'> {

    private pathPos: { x: number; y: number }[];
    private currentTile: Phaser.Tilemaps.Tile | null;
    private prevTile: Phaser.Tilemaps.Tile | null;

    constructor(scene: BattleScene, stateData: StateData<'idle'>) {
        super(scene, stateData);
        this.pathPos = [];
        this.currentTile = null;
        this.prevTile = null;
    }

    init(): void {
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
        const pos: Position = {
            x: pointer.worldX,
            y: pointer.worldY
        };

        const { tilemap, decorLayer, pathfinder } = this.scene.map;
        const { tileWidth, tileHeight } = tilemap;

        this.currentTile = decorLayer.getTileAtWorldXY(pos.x, pos.y);
        if (this.currentTile) {

            if (this.prevTile
                && this.currentTile.x === this.prevTile.x && this.currentTile.y === this.prevTile.y) {
                return;
            }

            const currentCharacter = this.scene.cycle.getCurrentCharacter();

            const mainPos = currentCharacter.position;

            const pathPromise = pathfinder.calculatePath(mainPos.x, mainPos.y, this.currentTile.x, this.currentTile.y);

            pathPromise.promise.then(path => {
                this.pathPos = path.map(p => {
                    const pos = tilemap.tileToWorldXY(p.x, p.y);
                    pos.x += tileWidth / 2;
                    pos.y += tileHeight / 2;
                    return pos;
                });
            });

            this.prevTile = this.currentTile;
        }
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {

        if (!this.currentTile
            || !this.pathPos.length) {
            return;
        }

        Controller.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: {
                state: "move",
                data: {
                    currentTile: this.currentTile,
                    pathPositions: this.pathPos
                }
            }
        });
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics) {

        graphics.beginPath();

        graphics.lineStyle(2, 0xff0000, 1);

        this.pathPos.forEach((p, i) => {
            if (!i) {
                graphics.moveTo(p.x, p.y);
            } else {
                graphics.lineTo(p.x, p.y);
            }
        });

        graphics.strokePath();
    }

    onTurnEnd(): void {
    }
}