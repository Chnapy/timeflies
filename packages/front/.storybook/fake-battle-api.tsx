import { assertIsDefined, BattleLoadEndedCAction, BattleLoadSAction, BRunGlobalTurnStartSAction, BRunLaunchSAction, ClientAction, ConfirmSAction, GLOBALTURN_DELAY, MatchmakerClientAction, ServerAction, TeamSnapshot, TURN_DELAY, NotifySAction, Position, PlayerRoom, TeamRoom } from '@timeflies/shared';
import { Controller } from '../src/Controller';
import { serviceBattleData } from '../src/services/serviceBattleData';
import { serviceDispatch } from '../src/services/serviceDispatch';
import { serviceEvent } from '../src/services/serviceEvent';
import { ReceiveMessageAction, SendMessageAction, WebSocketCreator } from '../src/socket/WSClient';
import { seedTeamSnapshot } from '../src/stages/battle/entities/team/Team.seed';
import { GameState } from '../src/game-state';
import mapPath from '../src/_assets/map/map.json';
import spritesheetPath from '../src/_assets/spritesheets/sokoban.json';
import React from 'react';
import { Provider } from 'react-redux';
import { StageChangeAction } from '../src/stages/StageManager';
import { GameAction } from '../src/action/game-action/GameAction';

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
        setImmediate(() => {
            this.onopen && this.onopen(null as any);
        });
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

export interface FakeBattleApiStarter {
    start: (container: Element) => Promise<FakeBattleApiRunner>;
    Provider: React.FC;
}

export interface FakeBattleApiRunner {
    startCycleLoop(): void;
    stopCycleLoop(): void;
    rollback(): void;
    notify(): void;
}

export type FakeBattleApi = ReturnType<typeof FakeBattleApi>;

export const FakeBattleApi = () => {

    let isInBattle: boolean = false;

    const dispatch = <A extends GameAction>(action: A) => serviceDispatch({
        dispatch: <A extends GameAction>(action: A): A => action
    }).dispatch(action);

    const receiveAction = <A extends ServerAction>(message: A) =>
        serviceDispatch({
            dispatch: (): ReceiveMessageAction<A> => ({
                type: 'message/receive',
                message
            })
        }).dispatch();

    const getTeamSnapshots = (): TeamSnapshot[] => {
        return [
            seedTeamSnapshot({
                id: 'T1',
                color: 'blue',
                seedPlayers: [
                    {
                        id: 'p1',
                        seedCharacters: [
                            {
                                id: 'C1',
                                seedSpells: [
                                    {
                                        id: 'S1', type: 'move', initialFeatures: {
                                            duration: 200
                                        }
                                    },
                                    {
                                        id: 'S2', type: 'simpleAttack', initialFeatures: {
                                            duration: 1000, attack: 20, area: 5
                                        }
                                    }
                                ],
                                features: {
                                    actionTime: 6_000
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
                        id: 'p2',
                        seedCharacters: [
                            {
                                id: 'C2',
                                seedSpells: [
                                    { id: 'S2', type: 'move' }
                                ],
                                features: {
                                    actionTime: 6_000
                                },
                                position: { x: 6, y: 3 }
                            }
                        ]
                    }
                ]
            })
        ];
    };

    const getGlobalState = (gtid: number, turnid: number) => ({
        id: gtid,
        startTime: Date.now(),
        order: [ 'C1', 'C2' ],
        currentTurn: {
            id: turnid,
            characterId: 'C1',
            startTime: Date.now()
        }
    });

    const initWSActions = () => {

        const sendFns: {
            [ key in ClientAction[ 'type' ] ]?: (action: Omit<ClientAction, 'sendTime'>) => void
        } = {};

        const { onAction } = serviceEvent();

        const onSendAction = <A extends ClientAction>(
            type: A[ 'type' ],
            fn: (action: Omit<A, 'sendTime'>
            ) => void) => {

            sendFns[ type ] = (fn as any);
        };

        onAction<SendMessageAction<ClientAction>>('message/send', ({ message }) => {
            const fn = sendFns[ message.type ];

            if (fn) {
                setImmediate(() => fn(message));
            }
        });

        return {
            onSendAction
        };
    };

    const initController = (
        initialState: GameState | undefined,
        websocketCreator: WebSocketCreator
    ) => {
        const { start } = Controller.init({ initialState, websocketCreator });

        const { onSendAction } = initWSActions();

        const { onMessageAction } = serviceEvent();

        onSendAction<MatchmakerClientAction>('matchmaker/enter', () => {

            receiveAction<BattleLoadSAction>({
                type: 'battle-load',
                sendTime: Date.now(),
                payload: {
                    mapConfig: {
                        id: 'm1',
                        schemaUrl: mapPath,
                        name: 'm1',
                        height: 10,
                        width: 10,
                        previewUrl: '',
                        nbrCharactersPerTeam: 1,
                        nbrTeams: 1
                    },
                    playerInfos: {
                        id: 'P1',
                        name: 'p1'
                    }
                }
            });
        });

        onMessageAction<BattleLoadSAction>('battle-load', async () => {

            await Controller.loader.newInstance()
                .add('map', mapPath)
                .addSpritesheet('characters', spritesheetPath)
                .load();

            dispatch<StageChangeAction<'battle'>>({
                type: 'stage/change',
                stageKey: 'battle',
                payload: {
                    mapConfig: {
                        id: 'm1',
                        schemaUrl: mapPath,
                        name: 'm1',
                        height: 10,
                        width: 10,
                        previewUrl: '',
                        nbrCharactersPerTeam: 1,
                        nbrTeams: 1
                    },
                    battleSnapshot: {
                        battleHash: 'hash',
                        launchTime: Date.now(),
                        time: Date.now(),
                        teamsSnapshots: getTeamSnapshots()
                    },
                    globalTurnState: getGlobalState(1, 1),
                    battleData: {
                        cycle: {
                            launchTime: Date.now()
                        },
                        current: {
                            battleHash: '',
                            teams: [],
                            players: [],
                            characters: []
                        },
                        future: {
                            battleHash: '',
                            teams: [],
                            players: [],
                            characters: [],
                            spellActionSnapshotList: []
                        }
                    }
                }
            });
            isInBattle = true;
        });

        return {
            start,
            onSendAction,
            receiveAction
        };
    };

    const _initialState: GameState = {
        step: 'boot',
        currentPlayer: {
            id: 'p1',
            name: 'Player 1'
        },
        room: null,
        battle: null
    };

    return {

        init({ initialState = _initialState }: {
            initialState?: GameState;
        }): FakeBattleApiStarter {

            let socket!: MockWebSocket;

            const websocketCreator: WebSocketCreator = () => {
                socket = new MockWebSocket();
                return socket;
            };

            const { start, receiveAction } = initController(initialState, websocketCreator);

            return {

                Provider: ({ children }) => (
                    <Provider store={Controller.getStore()}>
                        {children}
                    </Provider>
                ),

                start: (container: Element) => start(container)
                    .then(() => new Promise(r => {
                        socket.onopen!(null as any);

                        const interval = setInterval(() => {
                            if (isInBattle) {
                                clearInterval(interval);
                                r();
                            }
                        }, 50);
                    }))
                    .then((): FakeBattleApiRunner => {

                        let timeout: NodeJS.Timeout;

                        return {
                            startCycleLoop() {

                                const { launchTime } = serviceBattleData('cycle');
                                const delta = Date.now() - launchTime;

                                const { characters } = serviceBattleData('future');

                                let timeToWait = GLOBALTURN_DELAY;
                                characters.forEach(c => {
                                    timeToWait += c.staticData.initialFeatures.actionTime + TURN_DELAY
                                });

                                const turnIncrement = characters.length;
                                let gtid = 1;
                                let turnid = 1;

                                const newGlobalTurn = () => {

                                    gtid++;
                                    turnid += turnIncrement;
                                    receiveAction<BRunGlobalTurnStartSAction>({
                                        type: 'battle-run/global-turn-start',
                                        sendTime: Date.now(),
                                        globalTurnState: getGlobalState(gtid, turnid)
                                    });

                                    timeout = setTimeout(newGlobalTurn, timeToWait);
                                };

                                timeout = setTimeout(newGlobalTurn, timeToWait - delta);

                            },

                            stopCycleLoop() {
                                clearTimeout(timeout);
                            },

                            rollback() {

                                const { battleHash } = serviceBattleData('current');

                                receiveAction<ConfirmSAction>({
                                    type: 'confirm',
                                    sendTime: Date.now(),
                                    isOk: false,
                                    lastCorrectHash: battleHash
                                });
                            },

                            notify() {

                                const { globalTurn } = serviceBattleData('cycle');
                                assertIsDefined(globalTurn);

                                const character = globalTurn.currentTurn.character;
                                const { defaultSpell, position } = character;

                                const nextPosition: Position = {
                                    x: position.x + 1,
                                    y: position.y
                                };

                                receiveAction<NotifySAction>({
                                    type: 'notify',
                                    sendTime: Date.now(),
                                    spellActionSnapshot: {
                                        startTime: Date.now(),
                                        spellId: defaultSpell.id,
                                        battleHash: Date.now() + '',
                                        characterId: character.id,
                                        duration: defaultSpell.feature.duration,
                                        position: nextPosition,
                                        actionArea: [ nextPosition ],
                                        fromNotify: true,
                                        validated: true
                                    }
                                });
                            }
                        };
                    })
            }
        },
    };
};
