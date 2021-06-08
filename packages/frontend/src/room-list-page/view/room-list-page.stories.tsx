import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { RoomListGetListMessage } from '@timeflies/socket-messages';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { BattleAssetsLoader } from '../../battle-page/assets-loader/view/battle-assets-loader';
import { ErrorList } from '../../error-list/view/error-list';
import { routes } from '../../routes';
import { rootReducer } from '../../store/root-reducer';
import { RoomListPage } from './room-list-page';

export default {
    title: 'Room-list page',
} as Meta;

export const Default: React.FC = () => {
    const [ store ] = React.useState(() => configureStore({
        preloadedState: {
            credentials: {
                playerId: 'p1',
                playerName: 'chnapy',
                token: '---'
            },
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
                    // {
                    //     ...SocketErrorMessage({ code: 403 }),
                    //     requestId: message.requestId
                    // } as any,

                    RoomListGetListMessage.createResponse(message.requestId, [
                        { roomId: '1', playerAdmin: { playerId: 'p1', playerName: 'chnapy' }, map: null, nbrPlayers: 0, state: 'open' },
                        { roomId: '2', playerAdmin: { playerId: 'p2', playerName: 'yoshi2oeuf' }, map: { mapId: 'm1', name: 'dungeon' }, nbrPlayers: 3, state: 'in-battle' },
                        { roomId: '3', playerAdmin: { playerId: 'p3', playerName: 'foo-bar' }, map: { mapId: 'm1', name: 'dungeon' }, nbrPlayers: 2, state: 'open' },
                        // ...ArrayUtils.range(30).map((i): RoomInfos => ({
                        //     roomId: i + '_', playerAdmin: { playerId: 'p1', playerName: 'chnapy' }, map: null, nbrPlayers: 0, state: 'open'
                        // }))
                    ]) as any
                ])
            );

            return () => { };
        },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: ([ m ]) => { message = m; }
    });

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>
                <BattleAssetsLoader>
                    <BrowserRouter>

                        <Switch>
                            <Route path={routes.roomPage({})}>
                                <div>Room page</div>
                            </Route>
                            <Route >
                                <RoomListPage />
                            </Route>
                        </Switch>

                        <ErrorList />
                    </BrowserRouter>
                </BattleAssetsLoader>
            </SocketContextProvider>
        </Provider>
    );
};
