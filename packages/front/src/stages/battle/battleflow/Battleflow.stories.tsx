import { BattleLoadSAction, ClientAction, MatchmakerClientAction, ServerAction, BattleLoadEndedCAction, BRunLaunchSAction, BRunGlobalTurnStartSAction } from '@timeflies/shared';
import React from 'react';
import { Controller } from '../../../Controller';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { ReceiveMessageAction, SendMessageAction, WebSocketCreator } from '../../../socket/WSClient';
import { seedCharacter, seedCharacterData } from '../../../__seeds__/seedCharacter';
import { BStateTurnEndAction } from '../battleState/BattleStateSchema';

export default {
    title: 'Battleflow'
};

class MockWebSocket implements WebSocket {
    prototype: any;

    readonly CLOSED: any;
    readonly CLOSING: any;
    readonly CONNECTING: any;
    readonly OPEN: any = WebSocket.OPEN;

    binaryType;
    bufferedAmount;
    extensions;
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;
    protocol;
    readyState = WebSocket.OPEN;
    url;

    constructor() {
    }

    close(code?: number | undefined, reason?: string | undefined): void {
    }
    send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void {
    }

    addEventListener<K extends "close" | "error" | "message" | "open">(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: any, listener: any, options?: any) {
    }

    removeEventListener<K extends "close" | "error" | "message" | "open">(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: any, listener: any, options?: any) {
    }

    dispatchEvent(event: Event): boolean {
        return false;
    }
}

const sendFns: { [ key in ClientAction[ 'type' ] ]?: (action: Omit<ClientAction, 'sendTime'>) => void } = {};

const { onAction } = serviceEvent();

onAction<SendMessageAction<ClientAction>>('message/send', ({ message }) => {
    const fn = sendFns[ message.type ];

    if (fn) {
        setImmediate(() => fn(message));
    }
});

const onSendAction = <A extends ClientAction>(type: A[ 'type' ], fn: (action: Omit<A, 'sendTime'>) => void) => {

    sendFns[ type ] = (fn as any);
};

const receiveAction = <A extends ServerAction>(message: A) =>
    serviceDispatch({
        dispatch: (): ReceiveMessageAction<A> => ({
            type: 'message/receive',
            message
        })
    }).dispatch();

export const Default: React.FC = () => {

    onSendAction<MatchmakerClientAction>('matchmaker/enter', () => {

        receiveAction<BattleLoadSAction>({
            type: 'battle-load',
            sendTime: Date.now(),
            payload: {
                mapInfos: {
                    initLayerKey: 'init',
                    decorLayerKey: 'decors',
                    obstaclesLayerKey: 'obstacles',
                    mapKey: 'sampleMap1',
                    tilemapKey: '',
                    urls: {
                        schema: 'http://127.0.0.1:8887/map_2.json',
                        sheet: 'http://localhost',
                    }
                },
                characterTypes: [],
                spellTypes: [],
                playerInfos: {
                    id: 'P-1234',
                    name: 'toto'
                }
            }
        });
    });

    onSendAction<BattleLoadEndedCAction>('battle-load-end', () => {


        receiveAction<BRunLaunchSAction>({
            type: 'battle-run/launch',
            sendTime: Date.now(),
            battleSnapshot: {
                battleHash: 'hash',
                launchTime: Date.now(),
                time: Date.now(),
                teamsSnapshots: [
                    {
                        id: 't1',
                        name: 'Team One',
                        color: 'red',
                        playersSnapshots: [ {
                            id: 'P-1234',
                            name: 'Player mine',
                            state: 'battle-run' as const,
                            charactersSnapshots: [
                                seedCharacterData({
                                    id: 'c-1',
                                    staticData: {
                                        id: 'c-1',
                                        defaultSpellId: 'c-1-s-1',
                                        staticSpells: [ {
                                            id: 'c-1-s-1',
                                            color: 'red',
                                            name: 'move',
                                            type: 'move',
                                            initialFeatures: {
                                                area: 1,
                                                attack: -1,
                                                duration: 200
                                            }
                                        } ],
                                        initialFeatures: {
                                            actionTime: 4000,
                                            life: 100
                                        }
                                    },
                                    spellsSnapshots: [ {
                                        id: 'c-1-s-1',
                                        features: {
                                            area: 1,
                                            attack: -1,
                                            duration: 200
                                        },
                                        staticData: {
                                            id: 'c-1-s-1',
                                            color: 'red',
                                            name: 'move',
                                            type: 'move',
                                            initialFeatures: {
                                                area: 1,
                                                attack: -1,
                                                duration: 200
                                            }
                                        }
                                    } ]
                                }),
                            ]
                        } ]
                    },
                    {
                        id: 't2',
                        name: 'Team Two',
                        color: 'blue',
                        playersSnapshots: [ {
                            id: 'P-bot1',
                            name: 'Player bot 1',
                            state: 'battle-run' as const,
                            charactersSnapshots: [
                                seedCharacterData({
                                    id: 'c-bot-1',
                                    staticData: {
                                        id: 'c-bot-1',
                                        defaultSpellId: 'c-2-s-1',
                                        staticSpells: [ {
                                            id: 'c-2-s-1',
                                            color: 'red',
                                            name: 'move',
                                            type: 'move',
                                            initialFeatures: {
                                                area: 1,
                                                attack: -1,
                                                duration: 200
                                            }
                                        } ],
                                        initialFeatures: {
                                            actionTime: 4000,
                                            life: 100
                                        }
                                    },
                                    spellsSnapshots: [ {
                                        id: 'c-2-s-1',
                                        features: {
                                            area: 1,
                                            attack: -1,
                                            duration: 200
                                        },
                                        staticData: {
                                            id: 'c-2-s-1',
                                            color: 'red',
                                            name: 'move',
                                            type: 'move',
                                            initialFeatures: {
                                                area: 1,
                                                attack: -1,
                                                duration: 200
                                            }
                                        }
                                    } ]
                                }),
                            ]
                        } ]
                    }
                ]
            },
            globalTurnState: {
                id: 1,
                startTime: Date.now(),
                order: [ 'c-1', 'c-bot-1' ],
                currentTurn: {
                    id: 1,
                    startTime: Date.now(),
                    characterId: 'c-1'
                }
            }
        })

    });

    let gtid = 1;
    let turnid = 1;
    
    setTimeout(() => {
        gtid++;
        turnid += 2;
        receiveAction<BRunGlobalTurnStartSAction>({
            type: 'battle-run/global-turn-start',
            sendTime: Date.now(),
            globalTurnState: {
                id: gtid,
                startTime: Date.now(),
                order: [ 'c-1', 'c-bot-1' ],
                currentTurn: {
                    id: turnid,
                    characterId: 'c-1',
                    startTime: Date.now()
                }
            }
        });

    }, 10000);

    React.useEffect(() => {

        let socket!: MockWebSocket;

        const websocketCreator: WebSocketCreator = () => {

            socket = new MockWebSocket();

            return socket;
        }

        Controller.start(websocketCreator);

        socket.onopen!(null as any);

    }, []);

    return null;
};
