import { BattleLoadEndedCAction, BattleLoadSAction, BRunGlobalTurnStartSAction, BRunLaunchSAction, ClientAction, MatchmakerClientAction, ServerAction } from '@timeflies/shared';
import React from 'react';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { serviceEvent } from '../../../services/serviceEvent';
import { ReceiveMessageAction, SendMessageAction } from '../../../socket/WSClient';
import mapPath from '../../../_assets/map/map.json';
import { seedTeamSnapshot } from '../entities/team/Team.seed';
import { StoryProps } from '../../../../.storybook/preview';

export default {
    title: 'Battleflow'
};

export const Default: React.FC<StoryProps> = ({ controllerStart }) => {

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
                    schemaUrl: mapPath,
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

        controllerStart(ref.current!);

    }, []);

    return <div ref={ref} style={{
        width: '100%',
        height: '100%'
    }} />;
};
