import { AssetManager } from '../../assetManager/AssetManager';
import { BattleSpellLaunchAction, BattleTurnStartAction } from '../../phaser/battleReducers/BattleReducerManager';
import { CharAction } from '../../phaser/cycle/CycleManager';
import { Character } from '../../phaser/entities/Character';
import { Spell } from '../../phaser/entities/Spell';
import { ReducerManager } from '../../ReducerManager';
import { HUDScene } from '../HUDScene';
import { HasGameObject } from '../layout/HasGameObject';

export class TimeBar extends ReducerManager<HUDScene> implements HasGameObject {

    private readonly container: Phaser.GameObjects.Container;

    private readonly barBack: Phaser.GameObjects.Rectangle;
    private readonly barFront: Phaser.GameObjects.Rectangle;
    private readonly graphic: Phaser.GameObjects.Graphics;

    private maxHeight!: number;
    private width!: number;
    private lastTime: number;

    private currentTurn?: {
        character: Character;
        startTime: number;
        actions: CharAction[];
        images: Phaser.GameObjects.Image[];
    };

    constructor(scene: HUDScene) {
        super(scene);

        this.lastTime = 0;

        this.barBack = scene.add.rectangle()
            .setOrigin(1, 1)
            .setFillStyle(0x888888);

        this.barFront = scene.add.rectangle()
            .setOrigin(1, 1)
            .setFillStyle(0xFF4444);

        this.graphic = scene.add.graphics();
        this.graphic.displayOriginX = this.barFront.originX;
        this.graphic.displayOriginY = this.barFront.originY;

        this.container = scene.add.container(-1, -1, [
            this.barBack,
            this.barFront,
            this.graphic
        ]);
    }

    update(time: number, delta: number): void {
        this.graphic.clear();

        this.lastTime = time;

        this.barFront.displayHeight = this.computeFrontHeight(time);

        if (this.currentTurn) {
            const { actions } = this.currentTurn;

            this.graphic.fillStyle(0x00FF00, 0.5);
            actions.forEach(({ startTime, spell: { time: spellTime } }, i) => {
                const actionHeight = this.computeFrontHeight(
                    this.currentTurn!.startTime + this.currentTurn!.character.features.actionTime - spellTime
                );
                const actionY = this.computeFrontHeight(
                    startTime - Date.now() + time
                );

                this.graphic.fillRect(
                    this.width / 2 + 1, this.maxHeight - actionY,
                    this.width / 2 - 2, actionHeight
                );

                const image = this.currentTurn!.images[ i ];
                image.setPosition(this.width / 2, this.maxHeight - actionY);
            });
        }
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.maxHeight = height;
        this.width = width;
        this.container.setPosition(x, y);

        this.barBack.x = width;
        this.barBack.y = height;
        this.barBack.setDisplaySize(width / 2, height);

        this.barFront.x = width - 1;
        this.barFront.y = height - 1;
        this.barFront.setDisplaySize(width / 2 - 2, this.computeFrontHeight(this.lastTime))
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    private computeFrontHeight(time: number): number {
        if (!this.currentTurn) {
            return 0;
        }

        const { startTime, character: { features:{actionTime} } } = this.currentTurn;

        const elapsedTime = time - startTime;

        const ratio = 1 - elapsedTime / actionTime;

        return (this.maxHeight - 2) * ratio;
    }

    private readonly onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({
        character, time
    }) => {
        this.currentTurn?.images.forEach(child => this.container.remove(child));
        this.currentTurn = {
            character,
            startTime: time,
            actions: [],
            images: []
        };
    });

    private readonly onSpellLaunch = this.reduce<BattleSpellLaunchAction>('battle/spell/launch', ({
        charAction
    }) => {
        this.currentTurn!.actions.push(charAction);

        const { spell } = charAction;

        const time = new Phaser.Time.Clock(this.scene).now;

        const actionY = this.computeFrontHeight(
            charAction.startTime - Date.now() + time
        );

        const image = new Phaser.GameObjects.Sprite(this.scene,
            this.width / 2 + 200, this.maxHeight - actionY,
            Spell.getSheetKey(),
            AssetManager.spells.spellsMap[ spell.type ]);

        this.container.add(image);

        image.setOrigin(1, 0)
            .setDisplaySize(28, 28);
        // .setPosition(this.width / 2, this.maxHeight - actionY);

        if (spell.type === 'move'
            && this.currentTurn!.actions[ this.currentTurn!.actions.length - 2 ]?.spell.type === 'move') {
            image.setVisible(false);
        }

        this.currentTurn!.images.push(image);
    });
}
