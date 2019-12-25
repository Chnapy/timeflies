import { StateManager } from './StateManager';
import { Controller } from '../../Controller';
import { BattleCharacterPositionAction, BattleStateAction } from '../scenes/BattleScene';

export class StateManagerMoving extends StateManager<'move'> {

    init(): void {
        const { currentTile, pathPositions } = this.stateData;

        if (!currentTile
            || !pathPositions.length) {
            return;
        }

        const currentCharacter = this.scene.cycle.getCurrentCharacter();

        const { tilemap } = this.scene.map;

        const [ firstPos, ...restPos ] = pathPositions;

        const tweens = restPos.map(p => {

            return {
                targets: currentCharacter.sprite,
                x: { value: p.x, duration: 200 },
                y: { value: p.y, duration: 200 },
                onComplete: () => {
                    Controller.dispatch<BattleCharacterPositionAction>({
                        type: 'battle/character/position',
                        onlyGame: false as any,
                        character: currentCharacter,
                        position: {
                            x: tilemap.worldToTileX(p.x),
                            y: tilemap.worldToTileY(p.y)
                        }
                    });
                }
            };
        });

        this.scene.tweens.timeline({
            tweens,
            onComplete: () => {
                Controller.dispatch<BattleStateAction>({
                    type: 'battle/state',
                    stateObject: { state: "idle" }
                });
            }
        });
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(): void {
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }
}