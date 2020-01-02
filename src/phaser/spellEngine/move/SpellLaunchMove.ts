import { SpellLaunch, SpellResult } from '../SpellLaunch';
import { Position } from '../../entities/Character';
import { Controller } from '../../../Controller';
import { BattleSpellLaunchAction, BattleRollbackAction } from '../../battleReducers/BattleReducerManager';

export class SpellLaunchMove extends SpellLaunch<'move'> {

    private timeline?: Phaser.Tweens.Timeline;

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        const state = this.getLaunchState(targetPositions);

        const [ firstPos, ...nextPos ] = targetPositions;

        this.character.setPosition(firstPos, false, true, true);

        if (state === 'first') {
            this.onStart(targetPositions);
        }

        return new Promise<SpellResult>(resolve => {
            setTimeout(() => resolve({
                battleState: state === 'last',
                charState: state === 'last',
                grid: state === 'last'
            }), this.spell.time);
        });
    }

    protected beforeCancel(): void {
        this.onEnd();
    }

    private onStart(targetPositions: Position[]): void {

        this.character.setCharacterState('move');

        const duration = this.spell.time;

        const tweens: Phaser.Types.Tweens.TweenBuilderConfig[] = targetPositions.map((p, i) => {
            const pWorld = this.map.tileToWorldPosition(p, true);

            return {
                targets: this.character.graphicContainer,
                x: { value: pWorld.x, duration },
                y: { value: pWorld.y, duration },
                onStart: () => {
                    const nextPos = targetPositions.slice(i);

                    Controller.dispatch<BattleSpellLaunchAction>({
                        type: 'battle/spell/launch',
                        charAction: {
                            startTime: Date.now(),
                            spell: this.spell,
                            positions: nextPos
                        }
                    });
                }
            };
        });

        this.timeline = this.scene.tweens.timeline({
            tweens,
            onComplete: () => this.onEnd()
        });
    }

    private onEnd(): void {
        this.timeline?.pause();
        delete this.timeline;
    }

    private getLaunchState(targetPositions: Position[]): 'first' | 'middle' | 'last' {
        if (!this.timeline) {
            return 'first';
        }

        if (targetPositions.length === 1) {
            return 'last';
        }

        return 'middle';
    }
}