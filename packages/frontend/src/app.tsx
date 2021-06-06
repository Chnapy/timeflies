import { UIThemeProvider } from '@timeflies/app-ui';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { BattlePage } from './battle-page/battle-page';
import { ConnectedSocketContextProvider } from './connected-socket/connected-socket-context-provider';
import { NeedAuth } from './connected-socket/need-auth';
import './fonts-import.css';
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
                        <Switch>
                            <Route path={routes.roomListPage} exact>
                                <NeedAuth>
                                    <div>TODO room list</div>
                                </NeedAuth>
                            </Route>
                            <Route path={routes.roomPage}>
                                <NeedAuth>
                                    <div>TODO room</div>
                                </NeedAuth>
                            </Route>
                            <Route path={routes.battlePage}>
                                <NeedAuth>
                                    <BattlePage />
                                </NeedAuth>
                            </Route>
                        </Switch>
                    </BrowserRouter>
                </ConnectedSocketContextProvider>
            </UIThemeProvider>
        </Provider>
    );
};
