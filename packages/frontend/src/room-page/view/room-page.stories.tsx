import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { RoomPlayerJoinMessage } from '@timeflies/socket-messages';
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
            setImmediate(() =>
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
                                ready: false,
                                teamColor: '#0F0'
                            }
                        ],
                        staticCharacterList: [
                            {
                                characterId: 'c1',
                                playerId: 'p1',
                                characterRole: 'tacka',
                                placement: null
                            },
                            {
                                characterId: 'c2',
                                playerId: 'p1',
                                characterRole: 'vemo',
                                placement: null
                            },
                            {
                                characterId: 'c3',
                                playerId: 'p1',
                                characterRole: 'meti',
                                placement: null
                            },
                            {
                                characterId: 'c4',
                                playerId: 'p2',
                                characterRole: 'tacka',
                                placement: null
                            }
                        ]
                    }) as any
                ])
            );

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
