import { Spell } from '../../phaser/entities/Spell';
import { HUDScene } from '../HUDScene';
import { Cell } from '../layout/Cell';
import { SpellBtn } from './SpellBtn';
import { BattleTurnStartAction } from '../../phaser/battleReducers/BattleReducerManager';
import { CurrentSpell } from '../../phaser/spellEngine/SpellEngine';

export class SpellPane extends Cell {

    readonly container: Phaser.GameObjects.Container;
    private readonly spellBtns: SpellBtn[];

    constructor(scene: HUDScene) {
        super(scene);
        this.container = scene.add.container(0, 0);
        this.spellBtns = [];
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    protected updateSizes(): void {
        this.container.setPosition(this.x, this.y);

        const spellWidth = this.width / this.spellBtns.length;

        this.spellBtns.forEach((btn, i) => btn.resize(i * spellWidth, 0, spellWidth, this.height));
    }

    private setSpells(spells: Spell[]): void {
        this.spellBtns.forEach(btn => btn.removeAllReducers());
        this.spellBtns.length = 0;
        this.container.removeAll(true);

        this.spellBtns.push(...spells.map(s => new SpellBtn(this.scene, s)));
        this.container.add(this.spellBtns.map(s => s.getRootGameObject()));

        this.updateSizes();
    }

    private readonly onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({
        character: {isMine, spells}, time
    }) => {
        this.setSpells(isMine ? spells : []);
    });
}