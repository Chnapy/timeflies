import { BattleLoadPayload } from '@timeflies/shared';
import { IGameAction } from '../../action/GameAction';
import { ConnectedScene } from '../ConnectedScene';
import { LoadStage } from './LoadStage';

export interface LoadLaunchAction extends IGameAction<'load/launch'> {
    payload: BattleLoadPayload;
}

export type LoadAction =
    | LoadLaunchAction;

export class LoadScene extends ConnectedScene<'LoadScene', BattleLoadPayload> {

//@ts-ignore
    private readonly loadStage: LoadStage;

    constructor() {
        super({ key: 'LoadScene' });
        //@ts-ignore
        this.loadStage = LoadStage(this);
    }

    preload() {
        this.loadStage.onPreload();
    }

    create() {
        this.loadStage.onCreate();
    }

    update(time: number, delta: number): void {
    }
}
