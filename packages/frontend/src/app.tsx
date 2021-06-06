import { UIThemeProvider } from '@timeflies/app-ui';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { BattleAssetsLoader } from './battle-page/assets-loader/view/battle-assets-loader';
import { BattlePage } from './battle-page/battle-page';
import { ConnectedSocketContextProvider } from './connected-socket/connected-socket-context-provider';
import { NeedAuth } from './connected-socket/need-auth';
import { ErrorList } from './error-list/view/error-list';
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
                        <BattleAssetsLoader>
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

                            <ErrorList />
                        </BattleAssetsLoader>
                    </BrowserRouter>
                </ConnectedSocketContextProvider>
            </UIThemeProvider>
        </Provider>
    );
};
