import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { createPosition, waitMs } from '@timeflies/common';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { RoomEntityListGetMessage, RoomMapListGetMessage, RoomPlayerJoinMessage } from '@timeflies/socket-messages';
import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { ErrorList } from '../../error-list/view/error-list';
import { routes } from '../../routes';
import { rootReducer } from '../../store/root-reducer';
import { RoomPage } from './room-page';

export default {
    title: 'Room page',
} as Meta;

export const Default: React.FC = () => {
    const [ store ] = React.useState(() => configureStore({
        preloadedState: {
            credentials: {
                playerId: 'p1',
                playerName: 'chnapy',
                token: '---'
            }
        },
        reducer: rootReducer
    }));

    let message: any;
    const [ socketHelper ] = React.useState<SocketHelper>({
        url: '',
        addCloseListener: () => () => { },
        addMessageListener: listener => {
            setImmediate(async () => {
                await waitMs(2000);

                if (RoomMapListGetMessage.match(message)) {
                    listener([
                        RoomMapListGetMessage.createResponse(message.requestId, [
                            {
                                mapId: 'm1',
                                name: 'dungeon',
                                nbrTeams: 2,
                                nbrTeamCharacters: 3,
                                schemaLink: 'fake/maps/map_dungeon.json',
                                imagesLinks: {
                                    "tiles_dungeon_v1.1": 'fake/maps/map_dungeon.png'
                                }
                            },
                            {
                                mapId: 'm2',
                                name: 'dungeon2',
                                nbrTeams: 4,
                                nbrTeamCharacters: 3,
                                schemaLink: 'fake/maps/map_dungeon.json',
                                imagesLinks: {
                                    "tiles_dungeon_v1.1": 'fake/maps/map_dungeon.png'
                                }
                            },
                            {
                                mapId: 'm3',
                                name: 'dungeon',
                                nbrTeams: 2,
                                nbrTeamCharacters: 1,
                                schemaLink: 'fake/maps/map_dungeon.json',
                                imagesLinks: {
                                    "tiles_dungeon_v1.1": 'fake/maps/map_dungeon.png'
                                }
                            }
                        ]) as any
                    ]);

                } else if (RoomEntityListGetMessage.match(message)) {
                    listener([
                        RoomEntityListGetMessage.createResponse(message.requestId, {
                            characterList: [
                                {
                                    characterRole: 'tacka',
                                    defaultSpellRole: 'move',
                                    variables: {
                                        health: 100,
                                        actionTime: 9000
                                    }
                                },
                                {
                                    characterRole: 'vemo',
                                    defaultSpellRole: 'switch',
                                    variables: {
                                        health: 90,
                                        actionTime: 8000
                                    }
                                },
                                {
                                    characterRole: 'meti',
                                    defaultSpellRole: 'move',
                                    variables: {
                                        health: 80,
                                        actionTime: 9000
                                    }
                                }
                            ],
                            spellList: [
                                {
                                    characterRole: 'tacka',
                                    spellRole: 'move',
                                    variables: {
                                        duration: 800,
                                        rangeArea: 6,
                                        actionArea: 1,
                                        lineOfSight: true
                                    }
                                },
                                {
                                    characterRole: 'tacka',
                                    spellRole: 'simpleAttack',
                                    variables: {
                                        duration: 1500,
                                        rangeArea: 7,
                                        actionArea: 2,
                                        lineOfSight: true
                                    }
                                }
                            ]
                        }) as any
                    ]);

                } else {

                    listener([
                        RoomPlayerJoinMessage.createResponse(message.requestId, {
                            roomId: 'roomId',
                            mapInfos: {
                                mapId: 'm1',
                                name: 'dungeon',
                                nbrTeams: 2,
                                nbrTeamCharacters: 3,
                                schemaLink: 'fake/maps/map_dungeon.json',
                                imagesLinks: {
                                    "tiles_dungeon_v1.1": 'fake/maps/map_dungeon.png'
                                }
                            },
                            mapPlacementTiles: {
                                '#F00': [
                                    createPosition(8, 3),
                                    createPosition(9, 2),
                                    createPosition(10, 3),
                                    createPosition(9, 4)
                                ],
                                '#0F0': [
                                    createPosition(8, 9),
                                    createPosition(9, 8),
                                    createPosition(10, 9),
                                    createPosition(9, 10)
                                ]
                            },
                            playerAdminId: 'p1',
                            teamColorList: [ '#F00', '#0F0' ],
                            staticPlayerList: [
                                {
                                    playerId: 'p1',
                                    playerName: 'chnapy',
                                    ready: false,
                                    teamColor: '#0F0'
                                },
                                {
                                    playerId: 'p2',
                                    playerName: 'yoshi2oeuf',
                                    ready: true,
                                    teamColor: '#0F0'
                                },
                                {
                                    playerId: 'p3',
                                    playerName: 'toto',
                                    ready: true,
                                    teamColor: '#F00'
                                }
                            ],
                            staticCharacterList: [
                                {
                                    characterId: 'c1',
                                    playerId: 'p1',
                                    characterRole: 'tacka',
                                    placement: createPosition(8, 9)
                                },
                                {
                                    characterId: 'c2',
                                    playerId: 'p1',
                                    characterRole: 'vemo',
                                    placement: createPosition(9, 8)
                                },
                                {
                                    characterId: 'c3',
                                    playerId: 'p1',
                                    characterRole: 'meti',
                                    placement: createPosition(10, 9)
                                },
                                {
                                    characterId: 'c4',
                                    playerId: 'p2',
                                    characterRole: 'tacka',
                                    placement: null
                                },
                                {
                                    characterId: 'c5',
                                    playerId: 'p3',
                                    characterRole: 'tacka',
                                    placement: createPosition(8, 3)
                                }
                            ]
                        }) as any
                    ]);
                }
            });

            return () => { };
        },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: ([ m ]) => {
            console.log('message', m);
            message = m;
        }
    });

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>
                <AssetsLoader spritesheets={Assets.spritesheets} maps={{}}>
                    <MemoryRouter initialEntries={[ '/room/foo' ]}>

                        <Switch>
                            <Route>
                                <RoomPage />
                            </Route>
                            <Route {...routes.roomListPage()}>
                                <div>Room-list page</div>
                            </Route>
                            <Route {...routes.battlePage({})}>
                                <div>Battle page</div>
                            </Route>
                        </Switch>

                        <ErrorList />
                    </MemoryRouter>
                </AssetsLoader>
            </SocketContextProvider>
        </Provider>
    );
};
