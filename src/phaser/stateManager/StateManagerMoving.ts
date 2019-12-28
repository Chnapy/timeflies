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

        currentCharacter.setCharacterState('move');

        const sort = currentCharacter.sorts.find(s => s.type === 'move')!;
        const duration = sort.time;

        const pathTileSliced = pathTile.slice(1);

        const tweens: Phaser.Types.Tweens.TweenBuilderConfig[] = pathTileSliced
            .map((p, i) => {
                const pWorld = pathWorld[ i + 1 ];

                return {
                    targets: currentCharacter.graphicContainer,
                    x: { value: pWorld.x, duration },
                    y: { value: pWorld.y, duration },
                    onStart: () => {
                        Controller.dispatch<BattleCharacterPositionAction>({
                            type: 'battle/character/position',
                            character: currentCharacter,
                            position: p,
                            updateOrientation: true,
                            updatePositionGraphic: false,
                            updateOrientationGraphic: true,
                            commit: true
                        });

                        const charAction: CharAction = {
                            sortId: sort.id,
                            position: p
                        };
                
                        this.scene.cycle.addCharAction(charAction)
                            .then(confirm => console.log('success', confirm))
                            .catch(confirm => {
                                console.log('fail', confirm);
                
                                this.onTurnEnd();
                                this.scene.resetState(currentCharacter);
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

        const { cycle, dataStateManager } = this.scene;
        const character = cycle.getCurrentCharacter();

        dataStateManager.rollbackLast();
        character.setCharacterState('idle');
    }

    private deleteTimeline() {
        if (this.timeline) {
            this.timeline.pause();
            delete this.timeline;
        }
    }
}