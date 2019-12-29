import { Controller } from '../../Controller';
import { Character } from '../entities/Character';
import { BattleScene } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateData } from './BattleStateManager';
import { BattleCharacterPositionAction, BattleCharAction, BattleRollbackAction } from '../battleReducers/BattleReducerManager';
import { CharAction } from '../cycle/CycleManager';

export class BattleStateManagerMoving extends BattleStateManager<'move'> {

    private timeline?: Phaser.Tweens.Timeline;

    constructor(scene: BattleScene, stateData: BattleStateData<'move'>) {
        super('move', scene, stateData);
    }

    init(): void {
        const { pathTile, pathWorld } = this.stateData;

        const character = this.scene.getCurrentCharacter();

        character.setCharacterState('move');

        const sort = character.sorts.find(s => s.type === 'move')!;
        const duration = sort.time;

        const pathTileSliced = pathTile.slice(1);

        const tweens: Phaser.Types.Tweens.TweenBuilderConfig[] = pathTileSliced
            .map((p, i) => {
                const pWorld = pathWorld[ i + 1 ];

                return {
                    targets: character.graphicContainer,
                    x: { value: pWorld.x, duration },
                    y: { value: pWorld.y, duration },
                    onStart: () => {
                        Controller.dispatch<BattleCharacterPositionAction>({
                            type: 'battle/character/position',
                            character: character,
                            position: p,
                            updateOrientation: true,
                            updatePositionGraphic: false,
                            updateOrientationGraphic: true
                        });

                        const charAction: CharAction = {
                            sortId: sort.id,
                            position: p
                        };

                        Controller.dispatch<BattleCharAction>({
                            type: 'battle/charAction',
                            charAction,
                            callback: promise => promise
                                .catch(confirm => this.stopMove(character))
                        });
                    }
                };
            });

        this.timeline = this.scene.tweens.timeline({
            tweens,
            onComplete: () => {
                delete this.timeline;
                this.scene.resetState(character);
            }
        });

        // BattleRoomManager.mockResponse<ConfirmReceive>(1000, {
        //     type: 'confirm',
        //     isOk: false
        // }, 'last');
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

        const character = this.scene.getCurrentCharacter();

        this.stopMove(character);


        Controller.dispatch<BattleRollbackAction>({
            type: 'battle/rollback',
            config: {
                by: 'last'
            }
        });
    }

    private stopMove(character: Character) {
        if (this.timeline) {
            this.timeline.pause();
            delete this.timeline;
        }

        character.setCharacterState('idle');
    }
}