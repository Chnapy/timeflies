import { UIThemeProvider } from '@timeflies/app-ui';
import { AssetsLoader } from '@timeflies/assets-loader';
import { getSocketHelperCreator, SocketContextProvider } from '@timeflies/socket-client';
import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { BattlePage } from './battle-page/battle-page';
import './fonts-import.css';
import { createStoreManager } from './store/store-manager';
import { settings, SCALE_MODES } from 'pixi.js';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

const store = createStoreManager();

const createSocketHelper = getSocketHelperCreator('ws://localhost:40510');

const socketHelper = createSocketHelper('token');

export const App: React.FC = () => {

    return (
        <Provider store={store}>
            <UIThemeProvider>
                <SocketContextProvider value={socketHelper}>
                    <AssetsLoader
                        spritesheets={Assets.spritesheets}
                        maps={{}}
                    >
                        <BrowserRouter>
                            <Switch>
                                <Route path='/' exact>
                                    <div>
                                        Home<br />
                                        <Link to='/battle/battleId'>battle:battleId</Link>
                                    </div>
                                </Route>
                                <Route path='/battle/:battleId'>
                                    <BattlePage />
                                </Route>
                            </Switch>
                        </BrowserRouter>
                    </AssetsLoader>
                </SocketContextProvider>
            </UIThemeProvider>
        </Provider>
    );
};
