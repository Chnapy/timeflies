import { AssetManager } from '../../assetManager/AssetManager';
import { Controller } from '../../Controller';
import { BattleSpellLaunchAction, BattleSpellPrepareAction, BattleWatchAction } from '../../phaser/battleReducers/BattleReducerManager';
import { Spell } from '../../phaser/entities/Spell';
import { BasicStyleProperties, DefaultStyleEngine, Styled, StyleEngine } from '../generics/Styled';
import { HUDScene } from '../HUDScene';

export interface SpellBtnStyleProperties extends BasicStyleProperties {

}

export class SpellBtn extends Styled<SpellBtnStyleProperties> {

    static readonly SIZE = 42;

    readonly spell: Spell;

    private active: boolean;
    private disable: boolean;

    private readonly graphicSprite: Phaser.GameObjects.Image;
    private readonly graphicTimeText: Phaser.GameObjects.Text;
    private readonly graphicZoneText: Phaser.GameObjects.Text;
    private readonly graphicAttacText: Phaser.GameObjects.Text;

    constructor(scene: HUDScene, spell: Spell) {
        super(scene);
        this.spell = spell;

        this.active = spell.type === 'move';
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

        this.container.add([
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

                Controller.dispatch<BattleSpellPrepareAction>({
                    type: 'battle/spell/prepare',
                    spellType: this.active
                        ? 'move'
                        : spell.type
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

    private readonly onSpellPrepare = this.reduce<BattleSpellPrepareAction>('battle/spell/prepare', ({
        spellType
    }) => {
        this.active = spellType === this.spell.type;
        this.disable = false;
        this.updateGraphics();
    });

    private readonly onSpellLaunch = this.reduce<BattleSpellLaunchAction>('battle/spell/launch', ({
        charAction
    }) => {
        this.active = charAction.spell.type === this.spell.type;
        this.disable = true;
        this.updateGraphics();
    });

    private readonly onWatch = this.reduce<BattleWatchAction>('battle/watch', ({
    }) => {
        this.active = false;
        this.disable = true;
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

    protected getDefaultStyle(): SpellBtnStyleProperties {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }
    protected getStyleEngine(defaultStyleEngine: DefaultStyleEngine): StyleEngine<SpellBtnStyleProperties> {
        return {
            ...defaultStyleEngine,

            width: v => {},

            height: v => {},
        }
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
