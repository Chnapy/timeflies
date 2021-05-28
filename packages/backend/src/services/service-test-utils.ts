import { Message, MessageCreator, MessageWithResponseCreator } from '@timeflies/socket-messages';
import { ListenerFn, SocketCell } from '@timeflies/socket-server';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { Battle } from './battle/battle';
import { Room } from './room/room';

type SocketCellTestable = SocketCell & {
    getFirstListener: <M extends MessageCreator<any> | MessageWithResponseCreator<any, any>>(messageCreator: M) => ListenerFn<M>;
};

export const createFakeSocketCell = (): SocketCellTestable => {

    const _listeners: { [ type in Message[ 'action' ] ]: Array<ListenerFn<any>> } = {};

    return {
        addMessageListener: (messageCreator, listener) => {
            _listeners[ messageCreator.action ] = _listeners[ messageCreator.action ] ?? [];
            _listeners[ messageCreator.action ].push(listener);

            return jest.fn();
        },
        addDisconnectListener: jest.fn(),
        clearAllListeners: jest.fn(),
        closeSocket: jest.fn(),
        createCell: jest.fn(),
        send: jest.fn(),
        getFirstListener: messageCreator => _listeners[ messageCreator.action ][ 0 ]
    };
};

export const createFakeGlobalEntitiesNoService = (room?: Room, battle?: Battle): GlobalEntitiesNoServices => ({
    currentRoomMap: {
        mapById: {
            room
        },
        mapByPlayerId: {
            p1: room,
            p2: room,
            p3: room
        }
    },
    currentBattleMap: {
        mapById: {
            battle
        },
        mapByPlayerId: {
            p1: battle,
            p2: battle,
            p3: battle
        }
    }
});
