import { Controller } from '../../Controller';
import { Position } from '../entities/Character';
import { BattleScene, BattleStateAction } from '../scenes/BattleScene';
import { StateData, StateManager } from './StateManager';

export class StateManagerIdle extends StateManager<'idle'> {

    private pathWorld: Position[];
    private pathTile: Position[];
    private currentTile: Phaser.Tilemaps.Tile | null;
    private prevTile: Phaser.Tilemaps.Tile | null;

    constructor(scene: BattleScene, stateData: StateData<'idle'>) {
        super(scene, stateData);
        this.pathWorld = [];
        this.pathTile = [];
        this.currentTile = null;
        this.prevTile = null;
    }

    init(): this {

        const currentCharacter = this.scene.cycle.getCurrentCharacter();

        currentCharacter.setCharacterState('idle');

        return this;
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {

        const currentCharacter = this.scene.cycle.getCurrentCharacter();

        if(!currentCharacter.canMove()) {
            return;
        }

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

            const mainPos = currentCharacter.position;

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

        Controller.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: {
                state: "move",
                data: {
                    currentTile: this.currentTile,
                    pathWorld: this.pathWorld,
                    pathTile: this.pathTile
                }
            }
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

    onTurnEnd(): void {
    }
}