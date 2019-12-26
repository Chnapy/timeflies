import { Room } from '../../mocks/MockColyseus';
import { BattleRoomState, BattleScene } from '../scenes/BattleScene';

interface Message<T extends string> {
    type: T;
}

export interface BattleStartMessage extends Message<'start'> {
}

type BattleMessage =
    | BattleStartMessage;

export class BattleRoom {
    private readonly room: Room<BattleRoomState>;
    private readonly scene: BattleScene;

    get state(): BattleRoomState {
        return this.room.state;
    }

    constructor(room: Room<BattleRoomState>, scene: BattleScene) {
        this.room = room;
        this.scene = scene;
        room.onMessage(this.onMessage);
    }

    readonly send = <M extends BattleMessage>(message: M): void => {
        this.room.send(message);
    }

    private readonly onMessage = (message: BattleMessage): void => {
        console.log('MESSAGE', message);

        switch (message.type) {
            case 'start':
                this.scene.cycle.start();
                return;
        }
    };

    mockResponse<M extends BattleMessage>(time: number, data: M): void {
        this.room.mockResponse(time, data);
    }
}