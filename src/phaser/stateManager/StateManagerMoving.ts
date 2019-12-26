import { Controller } from '../../Controller';
import { BattleCharacterPositionAction } from '../scenes/BattleScene';
import { StateManager } from './StateManager';

export class StateManagerMoving extends StateManager<'move'> {

    private timeline?: Phaser.Tweens.Timeline;

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
                targets: currentCharacter.graphicContainer,
                x: { value: p.x, duration: 200 },
                y: { value: p.y, duration: 200 },
                onComplete: () => {
                    Controller.dispatch<BattleCharacterPositionAction>({
                        type: 'battle/character/position',
                        character: currentCharacter,
                        position: {
                            x: tilemap.worldToTileX(p.x),
                            y: tilemap.worldToTileY(p.y)
                        }
                    });
                }
            };
        });

        this.timeline = this.scene.tweens.timeline({
            tweens,
            onComplete: () => {
                delete this.timeline;
                this.scene.resetState(currentCharacter);
            }
        });
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
    }

    onTileClick(): void {
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }

    onTurnEnd(): void {
        
        if (!this.timeline) {
            return;
        }

        this.timeline.pause();
        delete this.timeline;

        const { cycle, map } = this.scene;
        const currentCharacter = cycle.getCurrentCharacter();
        const { position, graphicContainer } = currentCharacter;

        const worldPosition = map.tileToWorldPosition(position, true);
        graphicContainer.setPosition(worldPosition.x, worldPosition.y);
    }
}