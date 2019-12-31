import { Spell } from '../../phaser/entities/Spell';
import { HUDScene } from '../HUDScene';
import { AssetManager } from '../../assetManager/AssetManager';
import { HasGameObject } from '../layout/HasGameObject';
import { Controller } from '../../Controller';
import { BattleStateAction } from '../../phaser/battleReducers/BattleReducerManager';
import { ReducerManager } from '../../ReducerManager';

export class SpellBtn extends ReducerManager<HUDScene> implements HasGameObject {

    static SIZE = 42;

    readonly spell: Spell;

    private active: boolean;
    private disable: boolean;

    private readonly graphicSprite: Phaser.GameObjects.Image;
    private readonly graphicTimeText: Phaser.GameObjects.Text;
    private readonly graphicZoneText: Phaser.GameObjects.Text;
    private readonly graphicAttacText: Phaser.GameObjects.Text;

    private readonly container: Phaser.GameObjects.Container;

    constructor(scene: HUDScene, spell: Spell) {
        super(scene);
        this.spell = spell;

        this.active = false;
        this.disable = false;

        this.graphicSprite = scene.add.image(0, 0, Spell.getSheetKey());
        this.graphicTimeText = scene.add.text(0, 0, (spell.time / 1000).toString(), {
            'fontFamily': 'Open Sans',
            'backgroundColor': '#f39c12',
            'fontSize': '12px'
        });
        this.graphicZoneText = scene.add.text(0, 0, spell.zone.toString(), {
            'fontFamily': 'Open Sans',
            'backgroundColor': '#34495e',
            'fontSize': '12px'
        });
        this.graphicAttacText = scene.add.text(0, 0, spell.attaque.toString(), {
            'fontFamily': 'Open Sans',
            'backgroundColor': '#e74c3c',
            'fontSize': '12px'
        });

        this.container = scene.add.container(0, 0, [
            this.graphicSprite,
            this.graphicTimeText,
            this.graphicZoneText,
            this.graphicAttacText
        ]);

        this.graphicSprite
            .setFrame(AssetManager.spells.spellsMap[ spell.type ])
            .setDisplaySize(SpellBtn.SIZE, SpellBtn.SIZE)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                if (this.disable && !this.active) {
                    return;
                }

                Controller.dispatch<BattleStateAction>({
                    type: 'battle/state',
                    stateObject: this.active
                        ? {
                            state: 'idle'
                        }
                        : {
                            state: 'spellPrepare',
                            data: {
                                spell
                            }
                        }
                });
            });

        this.graphicTimeText
            .setPadding(2, 1, 2, 1)
            .setOrigin(0.5, 0);

        this.graphicZoneText
            .setPadding(2, 1, 2, 1)
            .setOrigin(1, 0.5);

        this.graphicAttacText
            .setPadding(2, 1, 2, 1)
            .setOrigin(0, 0.5);

        this.updateGraphics();
    }

    private readonly onStateChange = this.reduce<BattleStateAction>('battle/state', ({
        stateObject
    }) => {
        this.active = (stateObject.state === 'spellPrepare'
            || stateObject.state === 'spellLaunch')
            && stateObject.data.spell.id === this.spell.id;

        this.disable = stateObject.state !== 'idle';

        this.updateGraphics();
    });

    resize(x: number, y: number, width: number, height: number): void {
        this.container.setPosition(x, y);
        this.graphicSprite.setPosition(width / 2, height / 2);
        this.graphicTimeText.setPosition(width / 2, 0);
        this.graphicZoneText.setPosition(width / 2 - SpellBtn.SIZE / 2, height / 2);
        this.graphicAttacText.setPosition(width / 2 + SpellBtn.SIZE / 2, height / 2);
    }

    getRootGameObject() {
        return this.container;
    }

    private updateGraphics(): void {
        if (this.active) {
            this.graphicSprite.setTint(0xFFFFFF44);
        } else if (this.disable) {
            this.graphicSprite.setTint(0x888888AA);
        } else {
            this.graphicSprite.clearTint();
        }
    }
}
