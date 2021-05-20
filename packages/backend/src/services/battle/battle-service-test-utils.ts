import { ArrayUtils, createPosition, SerializableState } from '@timeflies/common';
import { Message, MessageCreator, MessageWithResponseCreator } from '@timeflies/socket-messages';
import { ListenerFn, SocketCell } from '@timeflies/socket-server';
import { computeChecksum } from '@timeflies/spell-effects';
import type { TiledLayer } from 'tiled-types';
import { GlobalEntitiesNoServices } from '../../main/global-entities';
import { Battle } from './battle';

type SocketCellTestable = SocketCell & {
    _listeners: { [ type in Message[ 'action' ] ]: Array<ListenerFn<any>> };
    getFirstListener: <M extends MessageCreator<any> | MessageWithResponseCreator<any, any>>(messageCreator: M) => ListenerFn<M>;
};

export const createFakeSocketCell = (): SocketCellTestable => {

    const _listeners: SocketCellTestable[ '_listeners' ] = {};

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
        _listeners,
        getFirstListener: messageCreator => _listeners[ messageCreator.action ][ 0 ]
    };
};

export const createFakeBattle = (): Battle => ({
    battleId: 'battle',
    staticPlayers: [
        { playerId: 'p1' } as any,
        { playerId: 'p2' } as any,
        { playerId: 'p3' } as any
    ],
    staticCharacters: [],
    staticSpells: [],
    staticState: {
        players: {
            p1: {
                playerId: 'p1',
                playerName: 'p-1',
                teamColor: '#FF0000'
            },
            p2: {
                playerId: 'p2',
                playerName: 'p-2',
                teamColor: '#00FF00'
            },
            p3: {
                playerId: 'p3',
                playerName: 'p-3',
                teamColor: '#0000FF'
            }
        },
        characters: {
            c1: {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            c2: {
                characterId: 'c2',
                playerId: 'p2',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            c3: {
                characterId: 'c3',
                playerId: 'p3',
                characterRole: 'meti',
                defaultSpellId: 's1'
            }
        },
        spells: {
            s1: {
                spellId: 's1',
                characterId: 'c1',
                spellRole: 'simpleAttack'
            }
        }
    },
    tiledMap: {
        layers: [ {
            name: 'obstacles',
            data: ArrayUtils.range(50)
        } as TiledLayer ]
    } as any,
    playerJoin: jest.fn(),
    getMapInfos: jest.fn(),
    getCycleInfos: jest.fn(),
    getCurrentState: jest.fn(() => {

        const state: SerializableState = {
            checksum: '',
            time: 1,
            characters: {
                health: { c1: 100, c2: 100, c3: 100 },
                position: { c1: createPosition(0, 0) },
                actionTime: { c1: 1000 },
                orientation: { c1: 'bottom' }
            },
            spells: {
                rangeArea: { s1: 500 },
                actionArea: { s1: 1 },
                lineOfSight: { s1: false },
                duration: { s1: 1 },
                attack: { s1: 10 }
            }
        };
        state.checksum = computeChecksum(state);
        return state;
    }),
    getCurrentTurnInfos: jest.fn(() => ({
        characterId: 'c1',
        startTime: 1
    })),
    addNewState: jest.fn()
});

export const createFakeGlobalEntitiesNoService = (battle: Battle): GlobalEntitiesNoServices => ({
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
