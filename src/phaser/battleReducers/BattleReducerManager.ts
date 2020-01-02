import { IGameAction } from '../../action/GameAction';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { ReducerManager } from '../../ReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CharAction, CycleManager } from '../cycle/CycleManager';
import { Character } from '../entities/Character';
import { SpellType } from '../entities/Spell';
import { MapManager } from '../map/MapManager';
import { BattleRoomManager, CharActionSend, SendPromise } from '../room/BattleRoomManager';
import { BattleData, BattleScene } from '../scenes/BattleScene';
import { SpellEngine } from '../spellEngine/SpellEngine';

export interface BattleStartAction extends IGameAction<'battle/start'> {
}

export interface BattleTurnStartAction extends IGameAction<'battle/turn/start'> {
    character: Character;
    time: number;
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
    charAction: CharAction;
    callback?: (promise: SendPromise<CharActionSend>) => void;
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

    readonly onBattleStart = this.reduce<BattleStartAction>('battle/start', action => {
        this.cycle.start();
    });

    readonly onWatch = this.reduce<BattleWatchAction>('battle/watch', ({
    }) => {
        this.spellEngine.watch();
    });

    readonly onSpellPrepare = this.reduce<BattleSpellPrepareAction>('battle/spell/prepare', ({
        spellType
    }) => {

        const spell = this.battleData.currentCharacter!.spells
            .find(s => s.type === spellType)!;

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
        charAction, callback
    }) => {

        const { spell, positions } = charAction;

        this.spellEngine.launch(positions)
            .then(spellResult => {

                if (spellResult.grid) {
                    this.map.pathfinder.setGrid();
                }

                if (spellResult.charState) {
                    spell.character.setCharacterState('idle');
                }

                if (spellResult.battleState) {
                    this.resetState(spell.character);
                }
            });

        const sendPromise = this.cycle.addCharAction(charAction)
            .catch(confirm => {
                this.spellEngine.cancel();
                return Promise.reject(confirm);
            });

        if (callback) {
            callback(sendPromise);
        }
    });

    readonly onRollback = this.reduce<BattleRollbackAction>('battle/rollback', ({
        config
    }) => {
        if (config.by === 'time') {
            this.dataStateManager.rollbackByTime(config.time);
        } else {
            this.dataStateManager.rollbackLast(config.nb);
        }
    });

    private resetState(character?: Character): void {
        Controller.dispatch<BattleSpellPrepareAction | BattleWatchAction>(character?.isMine
            ? {
                type: 'battle/spell/prepare',
                spellType: 'move'
            }
            : {
                type: 'battle/watch'
            });
    }
}