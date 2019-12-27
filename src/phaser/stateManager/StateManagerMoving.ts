import { Controller } from '../../Controller';
import { BattleCharacterPositionAction } from '../scenes/BattleScene';
import { StateManager } from './StateManager';
import { CharActionSend, ConfirmReceive, BattleRoomManager } from '../room/BattleRoomManager';
import { CharAction } from '../entities/CharAction';

export class StateManagerMoving extends StateManager<'move'> {

    private timeline?: Phaser.Tweens.Timeline;

    init(): this {
        const { pathTile, pathWorld } = this.stateData;

        const currentCharacter = this.scene.cycle.getCurrentCharacter();

        const pathTileSliced = pathTile.slice(1);

        const tweens = pathTileSliced
            .map((p, i) => {
                const pWorld = pathWorld[ i + 1 ];

                return {
                    targets: currentCharacter.graphicContainer,
                    x: { value: pWorld.x, duration: 200 },
                    y: { value: pWorld.y, duration: 200 },
                    onComplete: () => {
                        Controller.dispatch<BattleCharacterPositionAction>({
                            type: 'battle/character/position',
                            character: currentCharacter,
                            position: p,
                            updateGraphics: false
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

        const charAction: CharAction = {
            type: 'move',
            path: pathTile
        };

        this.scene.cycle.addCharAction(charAction)
            .then(confirm => console.log('success', confirm))
            .catch(confirm => {
                console.log('fail', confirm);

                this.deleteTimeline();

                Controller.dispatch<BattleCharacterPositionAction>({
                    type: 'battle/character/position',
                    character: currentCharacter,
                    position: pathTile[ 0 ],
                    updateGraphics: true
                });
            });

        BattleRoomManager.mockResponse<ConfirmReceive>(1000, {
            type: 'confirm',
            isOk: true
        }, 'last');

        return this;
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

        this.deleteTimeline();

        const { cycle } = this.scene;
        const character = cycle.getCurrentCharacter();
        const { position } = character;

        Controller.dispatch<BattleCharacterPositionAction>({
            type: 'battle/character/position',
            character,
            position,
            updateGraphics: true
        });
    }

    private deleteTimeline() {
        if (this.timeline) {
            this.timeline.pause();
            delete this.timeline;
        }
    }
}