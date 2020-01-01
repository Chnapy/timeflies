import { IGameAction } from '../../action/GameAction';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { ReducerManager } from '../../ReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CharAction, CycleManager } from '../cycle/CycleManager';
import { Character } from '../entities/Character';
import { MapManager } from '../map/MapManager';
import { BattleRoomManager, CharActionSend, SendPromise } from '../room/BattleRoomManager';
import { BattleData, BattleScene } from '../scenes/BattleScene';
import { BattleStateManager, BattleStateMap } from '../stateManager/BattleStateManager';
import { getBattleStateManagerFromState } from '../stateManager/getBattleStateManagerFromState';

export interface BattleStartAction extends IGameAction<'battle/start'> {
}

export interface BattleTurnStartAction extends IGameAction<'battle/turn/start'> {
    character: Character;
    time: number;
}

export interface BattleTurnEndAction extends IGameAction<'battle/turn/end'> {
    character: Character;
}

export interface BattleStateAction extends IGameAction<'battle/state'> {
    stateObject: BattleStateMap;
}

export interface BattleCharAction extends IGameAction<'battle/charAction'> {
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
    | BattleStateAction
    | BattleCharAction
    | BattleRollbackAction;

export class BattleReducerManager extends ReducerManager<BattleScene> {

    constructor(
        scene: BattleScene,
        private readonly battleData: BattleData,
        private readonly room: BattleRoomManager,
        private readonly dataStateManager: DataStateManager,
        private readonly cameraManager: CameraManager,
        private readonly getBattleStateManager: () => BattleStateManager<any>,
        private readonly setBattleStateManager: (battleStateManager: BattleStateManager<any>) => void,
        private readonly graphics: Phaser.GameObjects.Graphics,
        private readonly map: MapManager,
        private readonly cycle: CycleManager
    ) {
        super(scene);
    }

    readonly onBattleStart = this.reduce<BattleStartAction>('battle/start', action => {
        this.cycle.start();
    });

    readonly onStateChange = this.reduce<BattleStateAction>('battle/state', ({
        stateObject
    }) => {
        this.battleData.battleState = stateObject;
        const battleStateManager = getBattleStateManagerFromState(this.scene, this.battleData, stateObject);
        this.setBattleStateManager(battleStateManager);
        battleStateManager.init();
    });

    readonly onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({ character }) => {
        this.scene.resetState(character);
    });

    readonly onTurnEnd = this.reduce<BattleTurnEndAction>('battle/turn/end', ({ character }) => {

        this.getBattleStateManager().onTurnEnd();

        this.dataStateManager.commit();

        Controller.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });
    });

    readonly onCharAction = this.reduce<BattleCharAction>('battle/charAction', ({
        charAction, callback
    }) => {

        const { spell, positions } = charAction;
        const { spellAct } = spell;

        spellAct.launch(positions)
            .then(spellResult => {

                if(spellResult.grid) {
                    this.map.pathfinder.setGrid();
                }

                if(spellResult.charState) {
                    spell.character.setCharacterState('idle');
                }

                if(spellResult.battleState) {
                    this.scene.resetState(spell.character);
                }
            });

        const sendPromise = this.cycle.addCharAction(charAction)
            .catch(confirm => {
                spellAct.cancel();
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
}