import { StateManager, State } from './StateManager';
import { WorldScene } from '../scenes/WorldScene';

export class StateManagerIdle extends StateManager {

    private pathPos: { x: number; y: number }[];
    private currentTile: Phaser.Tilemaps.Tile | null;
    private prevTile: Phaser.Tilemaps.Tile | null;

    constructor(scene: WorldScene, setState: (state: State) => void) {
        super(scene, setState);
        this.pathPos = [];
        this.currentTile = null;
        this.prevTile = null;
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
        const pos = pointer.position;

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

            // console.log('hover', pointer, this.currentTile);

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

    onTileClick(): void {
        if (!this.currentTile
            || !this.pathPos.length) {
            return;
        }

        const currentCharacter = this.scene.cycle.getCurrentCharacter();

        const { position } = currentCharacter;

        const { tilemap } = this.scene.map;

        const [ firstPos, ...restPos ] = this.pathPos;

        const tweens = restPos.map(p => {

            return {
                targets: currentCharacter.sprite,
                x: { value: p.x, duration: 200 },
                y: { value: p.y, duration: 200 },
                onComplete: () => {
                    position.x = tilemap.worldToTileX(p.x);
                    position.y = tilemap.worldToTileY(p.y);
                }
            };
        });

        this.scene.tweens.timeline({
            tweens,
            onComplete: () => {
                this.setState('idle');
            }
        });

        this.setState('moving');
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
}