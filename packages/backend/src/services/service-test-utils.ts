import { Message, MessageCreator, MessageWithResponseCreator } from '@timeflies/socket-messages';
import { ListenerFn, SocketCell } from '@timeflies/socket-server';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { Battle } from './battle/battle';
import { Room } from './room/room';

type SocketCellTestable = SocketCell & {
    getFirstListener: <M extends MessageCreator<any> | MessageWithResponseCreator<any, any>>(messageCreator: M) => ListenerFn<M>;
    getDisconnectListener: () => (() => void) | null;
};

export const createFakeSocketCell = (): SocketCellTestable => {

    const _listeners: { [ type in Message[ 'action' ] ]: Array<ListenerFn<any>> } = {};
    let disconnectListener: (() => void) | null = null;

    return {
        addMessageListener: (messageCreator, listener) => {
            _listeners[ messageCreator.action ] = _listeners[ messageCreator.action ] ?? [];
            _listeners[ messageCreator.action ].push(listener);

            return jest.fn();
        },
        addDisconnectListener: jest.fn(listener => {
            disconnectListener = listener;
            return jest.fn();
        }),
        clearAllListeners: jest.fn(),
        closeSocket: jest.fn(),
        createCell: jest.fn(),
        send: jest.fn(),
        getFirstListener: messageCreator => _listeners[ messageCreator.action ][ 0 ],
        getDisconnectListener: () => disconnectListener
    };
};

export const createFakeGlobalEntitiesNoService = (room?: Room, battle?: Battle): GlobalEntitiesNoServices => ({
    playerCredentialsMap: {
        mapByToken: {},
        mapByPlayerName: {
            p1: {
                playerId: 'p1',
                playerName: 'p-1',
                token: '---'
            },
            p2: {
                playerId: 'p2',
                playerName: 'p-2',
                token: '---'
            },
            p3: {
                playerId: 'p3',
                playerName: 'p-3',
                token: '---'
            }
        }
    },
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
