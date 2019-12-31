import { IGameAction } from '../../action/GameAction';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { ReducerManager } from '../../ReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CharAction, CycleManager } from '../cycle/CycleManager';
import { Character, Position } from '../entities/Character';
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

export interface BattleCharacterPositionAction extends IGameAction<'battle/character/position'> {
    character: Character;
    position: Position;
    updateOrientation: boolean;
    updatePositionGraphic: boolean;
    updateOrientationGraphic: boolean;
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
    | BattleCharacterPositionAction
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

    readonly onCharacterPosition = this.reduce<BattleCharacterPositionAction>('battle/character/position', ({
        character, position, updateOrientation, updatePositionGraphic, updateOrientationGraphic
    }) => {

        character.setPosition(position, updatePositionGraphic, updateOrientation, updateOrientationGraphic);

        this.map.pathfinder.setGrid();

    });

    readonly onCharAction = this.reduce<BattleCharAction>('battle/charAction', ({
        charAction, callback
    }) => {
        const promise = this.cycle.addCharAction(charAction);

        if (callback) {
            callback(promise);
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