import { Position } from '@timeflies/shared'
import { Spell } from '../../stages/battle/entities/Spell';
import { BattleScene } from '../../stages/battle/BattleScene';
import { BattleData } from "../../BattleData";
import { SpellLaunchDefault } from './default/SpellLaunchDefault';
import { SpellPrepareDefault } from './default/SpellPrepareDefault';
import { SpellLaunchMove, LaunchState } from './move/SpellLaunchMove';
import { SpellPrepareMove } from './move/SpellPrepareMove';
import { SpellLaunchOrientate } from './orientate/SpellLaunchOrientate';
import { SpellPrepareOrientate } from './orientate/SpellPrepareOrientate';
import { SpellEngineAbstract } from './SpellEngineAbstract';
import { SpellLaunch, SpellResult } from './SpellLaunch';
import { SpellPrepare } from './SpellPrepare';

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

    async launch(targetPositions: Position[], spell: Spell, state: LaunchState[]): Promise<SpellResult> {
        if (!(this.engine instanceof SpellLaunch)) {
            this.setState({
                state: 'launch',
                spell
            });
        }
        return (this.engine as SpellLaunch<any>).launch(targetPositions, state);
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
            delete this.battleData.globalTurn?.currentTurn.currentSpell;
            delete this.engine;
        } else {
            this.battleData.globalTurn!.currentTurn.currentSpell = currentSpell;
            this.engine = this.getSpellEngine(currentSpell, this.scene);
        }
    }

    private getSpellEngine<S extends Exclude<CurrentSpellState, 'none'>>(
        currentSpell: CurrentSpell,
        scene: BattleScene
    ): SpellEngineAbstract<S, any> {
        const args = [currentSpell.spell, scene] as const;

        switch (currentSpell.state) {

            case 'prepare':
                switch (currentSpell.spell.staticData.type) {
                    case 'move':
                        return new SpellPrepareMove(...args);
                    case 'orientate':
                        return new SpellPrepareOrientate(...args);
                    default:
                        return new SpellPrepareDefault(...args);
                }

            case 'launch':
                switch (currentSpell.spell.staticData.type) {
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