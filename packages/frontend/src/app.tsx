import { UIThemeProvider } from '@timeflies/app-ui';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { BattleAssetsLoader } from './battle-page/assets-loader/view/battle-assets-loader';
import { BattlePage } from './battle-page/battle-page';
import { ConnectedSocketContextProvider } from './connected-socket/view/connected-socket-context-provider';
import { NeedAuth } from './connected-socket/view/need-auth';
import { ErrorList } from './error-list/view/error-list';
import './fonts-import.css';
import { RoomListPage } from './room-list-page/view/room-list-page';
import { RoomPage } from './room-page/view/room-page';
import { routes } from './routes';
import { createStoreManager } from './store/store-manager';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

const store = createStoreManager();

export const App: React.FC = () => {

    return (
        <Provider store={store}>
            <UIThemeProvider>
                <ConnectedSocketContextProvider>
                    <BrowserRouter>
                        <BattleAssetsLoader>
                            <Switch>
                                <Route {...routes.roomListPage()}>
                                    <NeedAuth>
                                        <RoomListPage />
                                    </NeedAuth>
                                </Route>
                                <Route {...routes.roomPage({})}>
                                    <NeedAuth>
                                        <RoomPage />
                                    </NeedAuth>
                                </Route>
                                <Route {...routes.battlePage({})}>
                                    <NeedAuth>
                                        <BattlePage />
                                    </NeedAuth>
                                </Route>

                                <Route>
                                    <Redirect to={routes.roomListPage().path}/>
                                </Route>
                            </Switch>

                            <ErrorList />
                        </BattleAssetsLoader>
                    </BrowserRouter>
                </ConnectedSocketContextProvider>
            </UIThemeProvider>
        </Provider>
    );
};
