import { SpellType } from '@timeflies/shared'
import { IGameAction } from '../../action/GameAction';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { ReducerManager } from '../../ReducerManager';
import { CameraManager } from '../../stages/battle/camera/CameraManager';
import { CharAction, CycleManager } from '../../stages/battle/cycle/CycleManager';
import { Character } from '../../stages/battle/entities/Character';
import { MapManager } from '../map/MapManager';
import { BattleRoomManager } from '../room/BattleRoomManager';
import { BattleScene, BattleSceneData } from '../../stages/battle/BattleScene';
import { BattleData } from "../../BattleData";
import { SpellEngine } from '../spellEngine/SpellEngine';
import { LaunchState } from '../spellEngine/move/SpellLaunchMove';

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    battleSceneData: BattleSceneData;
}

export interface BattleStartAction extends IGameAction<'battle/start'> {
}

export interface BattleTurnStartAction extends IGameAction<'battle/turn/start'> {
    character: Character;
    startTime: number;
}

export interface BattleTurnEndAction extends IGameAction<'battle/turn/end'> {
    character: Character;
}

export interface BattleWatchAction extends IGameAction<'battle/watch'> {
}

export interface BattleSpellPrepareAction extends IGameAction<'battle/spell/prepare'> {
    spellType: SpellType;
}

export interface BattleSpellLaunchAction extends IGameAction<'battle/spell/launch'> {
    charAction: CharAction<'running'>;
    launchState?: LaunchState[];  // TODO remove after stack action done
}

export interface BattleRollbackAction extends IGameAction<'battle/rollback'> {
    config: {
        by: 'time';
        time: number;
    } | {
        by: 'last';
        nb?: number;
    };
}

export type BattleSceneAction =
    | BattleLaunchAction
    | BattleStartAction
    | BattleTurnStartAction
    | BattleTurnEndAction
    | BattleWatchAction
    | BattleSpellPrepareAction
    | BattleSpellLaunchAction
    | BattleRollbackAction;

export class BattleReducerManager extends ReducerManager<BattleScene> {

    constructor(
        scene: BattleScene,
        private readonly battleData: BattleData,
        private readonly room: BattleRoomManager,
        private readonly dataStateManager: DataStateManager,
        private readonly cameraManager: CameraManager,
        private readonly spellEngine: SpellEngine,
        private readonly graphics: Phaser.GameObjects.Graphics,
        private readonly map: MapManager,
        private readonly cycle: CycleManager
    ) {
        super(scene);
    }

    readonly onWatch = this.reduce<BattleWatchAction>('battle/watch', () => {
        this.spellEngine.watch();
    });

    readonly onSpellPrepare = this.reduce<BattleSpellPrepareAction>('battle/spell/prepare', ({
        spellType
    }) => {
        const { currentTurn } = this.battleData.globalTurn!;

        /**
         * If currentSpell if alread selected, reset to default spell,
         * else, prepare the new spell
         */
        const spell = currentTurn.currentSpell?.spell.staticData.type === spellType
            && currentTurn.currentSpell.state === 'prepare'

            ? currentTurn.character.defaultSpell

            : currentTurn.character.spells
                .find(s => s.staticData.type === spellType)!;

        this.spellEngine.prepare(spell);
    });

    readonly onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({ character }) => {
        this.resetState(character);
    });

    readonly onTurnEnd = this.reduce<BattleTurnEndAction>('battle/turn/end', ({ character }) => {

        this.spellEngine.cancel();

        this.dataStateManager.commit();

        Controller.dispatch<BattleWatchAction>({
            type: 'battle/watch',
        });
    });

    readonly onSpellLaunch = this.reduce<BattleSpellLaunchAction>('battle/spell/launch', ({
        charAction, launchState
    }) => {

        const { character: currentCharacter } = this.battleData.globalTurn!.currentTurn;

        const fromServer = !currentCharacter.player.itsMe;

        const { spell, positions } = charAction;

        this.spellEngine.launch(positions, spell, launchState || ['first'])
            .then(spellResult => {

                if (spellResult.grid) {
                    this.map.pathfinder.refreshGrid();
                }

                if (spellResult.charState) {
                    spell.character.set({ state: 'idle' });
                }

                if (spellResult.battleState) {
                    this.resetState(spell.character);
                }
            });

        if (fromServer) {
            this.cycle.addCharAction(charAction);
            return;
        }

        this.cycle.addCharActionAndSend(charAction)
            .catch(confirm => {
                this.spellEngine.cancel();
                if (currentCharacter.id === this.battleData.globalTurn?.currentTurn.character.id) {
                    this.resetState(currentCharacter);
                }
            });
    });

    readonly onRollback = this.reduce<BattleRollbackAction>('battle/rollback', ({
        config
    }) => {
        if (config.by === 'time') {
            this.cycle.cancelCharActionByTime(config.time, Date.now());
            this.dataStateManager.rollbackByTime(config.time);
        } else {
            this.cycle.cancelCharActionLast(Date.now());
            this.dataStateManager.rollbackLast(config.nb);
        }
    });

    private resetState(character?: Character): void {
        Controller.dispatch<BattleSpellPrepareAction | BattleWatchAction>(character?.isMine
            ? {
                type: 'battle/spell/prepare',
                spellType: character.defaultSpell.staticData.type
            }
            : {
                type: 'battle/watch'
            });
    }
}