import { ReducerManager } from '../../ReducerManager';
import { HUDScene } from '../HUDScene';
import { HasGameObject } from '../layout/HasGameObject';
import { BattleSpellLaunchAction, BattleTurnStartAction } from '../../phaser/battleReducers/BattleReducerManager';
import { CharAction } from '../../phaser/cycle/CycleManager';
import { Spell } from '../../phaser/entities/Spell';
import { AssetManager } from '../../assetManager/AssetManager';

export class TimeStack extends ReducerManager<HUDScene> implements HasGameObject {

    private readonly container: Phaser.GameObjects.Container;
    private readonly charActions: Map<CharAction, Phaser.GameObjects.Image>;

    constructor(scene: HUDScene) {
        super(scene);
        this.container = scene.add.container(-1, -1);
        this.charActions = new Map();
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.container.setPosition(x, y);
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    private readonly onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({
        character, time
    }) => {
        this.charActions.clear();
        this.container.removeAll();
    });

    private readonly onSpellLaunch = this.reduce<BattleSpellLaunchAction>('battle/spell/launch', ({
        charAction
    }) => {
        const {spell} = charAction;

        const image = this.scene.add.image(-1, -1, Spell.getSheetKey());
        image.setFrame(AssetManager.spells.spellsMap[spell.type]);

        this.container.add(image);

        this.charActions.set(charAction, image);
    });
}
