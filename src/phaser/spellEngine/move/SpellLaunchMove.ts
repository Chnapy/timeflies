import { Position } from '@shared/Character';
import { Controller } from '../../../Controller';
import { BattleSpellLaunchAction } from '../../battleReducers/BattleReducerManager';
import { SpellLaunch, SpellResult } from '../SpellLaunch';

export class SpellLaunchMove extends SpellLaunch<'move'> {

    private timeline?: Phaser.Tweens.Timeline;

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        const state = this.getLaunchState(targetPositions);

        const [firstPos] = targetPositions;

        this.character.setPosition(firstPos, false, true, true);

        if (state === 'first') {
            this.onStart(targetPositions);
        }

        return new Promise<SpellResult>(resolve => {
            setTimeout(() => resolve({
                battleState: state === 'last',
                charState: state === 'last',
                grid: state === 'last'
            }), this.spell.feature.duration);
        });
    }

    protected beforeCancel(): void {
        this.onEnd();
    }

    private onStart(targetPositions: Position[]): void {

        this.character.setCharacterState('move');

        const duration = this.spell.feature.duration;

        const tweens = targetPositions.map<Phaser.Types.Tweens.TweenBuilderConfig>((p, i) => {
            const pWorld = this.map.tileToWorldPosition(p);

            return {
                targets: this.character.getGraphics(),
                x: { value: pWorld.x, duration },
                y: { value: pWorld.y, duration },
                onStart: () => {
                    const nextPos = targetPositions.slice(i);

                    Controller.dispatch<BattleSpellLaunchAction>({
                        type: 'battle/spell/launch',
                        charAction: {
                            state: 'running',
                            startTime: Date.now(),
                            spell: this.spell,
                            duration: this.spell.feature.duration,
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