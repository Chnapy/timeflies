import { Position } from '../entities/Character';
import { Spell } from '../entities/Spell';
import { BattleData, BattleScene } from '../scenes/BattleScene';
import { SpellLaunch, SpellResult } from './SpellLaunch';
import { SpellLaunchMove } from './move/SpellLaunchMove';
import { SpellLaunchOrientate } from './orientate/SpellLaunchOrientate';
import { SpellLaunchDefault } from './default/SpellLaunchDefault';
import { SpellEngineAbstract } from './SpellEngineAbstract';
import { SpellPrepare } from './SpellPrepare';
import { SpellPrepareDefault } from './default/SpellPrepareDefault';
import { SpellPrepareMove } from './move/SpellPrepareMove';
import { SpellPrepareOrientate } from './orientate/SpellPrepareOrientate';

export type CurrentSpellState = 'prepare' | 'launch';

export interface CurrentSpell {
    state: CurrentSpellState;
    spell: Spell;
}

export class SpellEngine {

    private readonly scene: BattleScene;
    private readonly battleData: BattleData;

    private engine?: SpellEngineAbstract<any, any>;

    constructor(scene: BattleScene, battleData: BattleData) {
        this.scene = scene;
        this.battleData = battleData;
    }

    async launch(targetPositions: Position[]): Promise<SpellResult> {
        if (!(this.engine instanceof SpellLaunch)) {
            this.setState({
                state: 'launch',
                spell: this.engine!.spell
            });
        }
        return (this.engine as SpellLaunch<any>).launch(targetPositions);
    }

    prepare(spell: Spell): void {
        this.setState({
            state: 'prepare',
            spell
        });
        (this.engine as SpellPrepare<any>).init();
    }

    watch(): void {
        this.setState(undefined);
    }

    cancel(): void {
        this.engine?.cancel();
        this.setState(undefined);
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
        this.engine?.update(time, delta, graphics);
    }

    onTileHover(pointer: Phaser.Input.Pointer): void {
        this.engine?.onTileHover(pointer);
    }

    onTileClick(pointer: Phaser.Input.Pointer): void {
        this.engine?.onTileClick(pointer);
    }

    private setState(currentSpell: CurrentSpell | undefined): void {

        if (!currentSpell) {
            delete this.battleData.currentTurn?.currentSpell;
            delete this.engine;
        } else {
            this.battleData.currentTurn!.currentSpell = currentSpell;
            this.engine = this.getSpellEngine(currentSpell, this.scene);
        }
    }

    private getSpellEngine<S extends Exclude<CurrentSpellState, 'none'>>(
        currentSpell: CurrentSpell,
        scene: BattleScene
    ): SpellEngineAbstract<S, any> {
        const args = [ currentSpell.spell, scene ] as const;

        switch (currentSpell.state) {

            case 'prepare':
                switch (currentSpell.spell.type) {
                    case 'move':
                        return new SpellPrepareMove(...args);
                    case 'orientate':
                        return new SpellPrepareOrientate(...args);
                    default:
                        return new SpellPrepareDefault(...args);
                }

            case 'launch':
                switch (currentSpell.spell.type) {
                    case 'move':
                        return new SpellLaunchMove(...args);
                    case 'orientate':
                        return new SpellLaunchOrientate(...args);
                    default:
                        return new SpellLaunchDefault(...args);
                }
        }
    }
}