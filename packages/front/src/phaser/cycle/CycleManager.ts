import { CharActionCAction } from '@timeflies/shared'
import { Position } from '@timeflies/shared'
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { Spell } from '../entities/Spell';
import { BattleRoomManager, SendPromise } from '../room/BattleRoomManager';
import { BattleData } from '../scenes/BattleScene';
import { GlobalTurn } from './GlobalTurn';
import { GlobalTurnSnapshot } from '@timeflies/shared'
import { TurnSnapshot } from '@timeflies/shared'

export interface GameTime {
    phaserTime: number;
    dateTime: number;
}

//TODO handle state
export type CharActionState = 'running' | 'complete' | 'canceled';

export type CharAction<S extends CharActionState = CharActionState> = {
    state: S;
    spell: Spell;
    positions: Position[];
    startTime: number;
    duration: number;
} & (S extends 'canceled'
    ? {
        cancelTime: number;
    }
    : {});

export class CycleManager {

    private readonly room: BattleRoomManager;
    private readonly dataStateManager: DataStateManager;
    private readonly battleData: BattleData;

    readonly players: readonly Player[];
    readonly characters: readonly Character[];

    get running(): boolean {
        return this.battleData.globalTurn?.currentTurn.state === 'running';
    }

    private get charActionStack(): CharAction[] {
        return this.battleData.globalTurn?.currentTurn.charActionStack || [];
    }

    private waitingSnapshots: GlobalTurnSnapshot[];

    constructor(room: BattleRoomManager, dataStateManager: DataStateManager, battleData: BattleData) {
        this.room = room;
        this.dataStateManager = dataStateManager;
        this.battleData = battleData;
        this.players = battleData.players;
        this.characters = battleData.characters;
        this.waitingSnapshots = [];
    }

    update(time: number, delta: number): void {
    }

    addCharActionAndSend(charAction: CharAction): SendPromise<CharActionCAction> {

        this.addCharAction(charAction);

        return this.room.send<CharActionCAction>({
            type: 'charAction',
            charAction: {
                spellId: charAction.spell.id,
                positions: charAction.positions
            }
        }, charAction.startTime);
    }

    addCharAction(charAction: CharAction): void {

        this.dataStateManager.commit(charAction.startTime);

        this.charActionStack.push(charAction);
    }

    cancelCharActionByTime(startTime: number, cancelTime: number): void {
        const charAction = this.charActionStack.find(ca => ca.startTime === startTime)!;
        charAction.state = 'canceled';
        (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
    }

    cancelCharActionLast(cancelTime: number): void {
        const charAction = this.charActionStack[this.charActionStack.length - 1];
        charAction.state = 'canceled';
        (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
    }

    synchronizeGlobalTurn(globalTurnSnapshot: GlobalTurnSnapshot): void {

        if (this.battleData.globalTurn?.id === globalTurnSnapshot.id) {
            this.battleData.globalTurn.synchronize(globalTurnSnapshot);
        } else {
            this.waitingSnapshots.push(globalTurnSnapshot);

            if(!this.battleData.globalTurn) {
                this.onGlobalTurnEnd();
            }
        }
    }

    synchronizeTurn(turnSnapshot: TurnSnapshot): void {
        const globalTurn = this.battleData.globalTurn!;

        globalTurn.synchronizeTurn(turnSnapshot);
    }

    private onGlobalTurnEnd = (): void => {
        delete this.battleData.globalTurn;

        const snapshot = this.waitingSnapshots.pop();
        if (snapshot)
            this.battleData.globalTurn = new GlobalTurn(snapshot, this.characters, this.onGlobalTurnEnd);
    };
}