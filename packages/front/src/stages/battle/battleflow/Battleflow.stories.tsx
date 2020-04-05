import { BattleLoadEndedCAction, BattleLoadSAction, BRunGlobalTurnStartSAction, BRunLaunchSAction, ClientAction, MatchmakerClientAction, ServerAction } from '@timeflies/shared';
import React from 'react';
import { Controller } from '../../../Controller';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { ReceiveMessageAction, SendMessageAction, WebSocketCreator } from '../../../socket/WSClient';
import { seedTeamSnapshot } from '../entities/team/Team.seed';

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

    Controller.reset();

    onAction<SendMessageAction<ClientAction>>('message/send', ({ message }) => {
        const fn = sendFns[ message.type ];

        if (fn) {
            setImmediate(() => fn(message));
        }
    });

    onSendAction<MatchmakerClientAction>('matchmaker/enter', () => {

        receiveAction<BattleLoadSAction>({
            type: 'battle-load',
            sendTime: Date.now(),
            payload: {
                mapInfos: {
                    id: '',
                    initLayerName: 'init',
                    defaultTilelayerName: 'view',
                    obstacleTilelayerName: 'obstacles',
                    schemaUrl: 'http://127.0.0.1:8887/map.json',
                },
                characterTypes: [],
                spellTypes: [],
                playerInfos: {
                    id: 'P1',
                    name: 'p1'
                }
            }
        });
    });

    onSendAction<BattleLoadEndedCAction>('battle-load-end', () => {

        const teamsSnapshots = [
            seedTeamSnapshot({
                id: 'T1',
                color: 'blue',
                seedPlayers: [
                    {
                        id: 'P1',
                        seedCharacters: [
                            {
                                id: 'C1',
                                seedSpells: [
                                    { id: 'S1', type: 'move' }
                                ],
                                features: {
                                    actionTime: 100_000
                                },
                                position: { x: 4, y: 3 }
                            }
                        ]
                    }
                ]
            }),
            seedTeamSnapshot({
                id: 'T2',
                color: 'red',
                seedPlayers: [
                    {
                        id: 'P2',
                        seedCharacters: [
                            {
                                id: 'C2',
                                seedSpells: [
                                    { id: 'S2', type: 'move' }
                                ],
                                features: {
                                    actionTime: 3000
                                },
                                position: { x: 6, y: 3 }
                            }
                        ]
                    }
                ]
            })
        ];
        console.log(teamsSnapshots);

        receiveAction<BRunLaunchSAction>({
            type: 'battle-run/launch',
            sendTime: Date.now(),
            battleSnapshot: {
                battleHash: 'hash',
                launchTime: Date.now(),
                time: Date.now(),
                teamsSnapshots
            },
            globalTurnState: {
                id: 1,
                startTime: Date.now(),
                order: [ 'C1', 'C2' ],
                currentTurn: {
                    id: 1,
                    startTime: Date.now(),
                    characterId: 'C1'
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
                order: [ 'C1', 'C2' ],
                currentTurn: {
                    id: turnid,
                    characterId: 'C1',
                    startTime: Date.now()
                }
            }
        });

    }, 10000);

    const ref = React.createRef<HTMLDivElement>();

    React.useEffect(() => {

        let socket!: MockWebSocket;

        const websocketCreator: WebSocketCreator = () => {
            socket = new MockWebSocket();
            return socket;
        };

        Controller.start(
            ref.current!,
            websocketCreator
        );

        socket.onopen!(null as any);

    }, []);

    return <div ref={ref} style={{
        width: '100%',
        height: '100%'
    }} />;
};
