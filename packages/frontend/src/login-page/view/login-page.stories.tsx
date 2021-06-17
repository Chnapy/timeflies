import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { BattleAssetsLoader } from '../../battle-page/assets-loader/view/battle-assets-loader';
import { routes } from '../../routes';
import { createStoreManager } from '../../store/store-manager';
import { LoginPage } from './login-page';

export default {
    title: 'Login page',
} as Meta;

export const Default: React.FC = () => {
    const [ store ] = React.useState(createStoreManager);

    return (
        <Provider store={store}>
            <BattleAssetsLoader>
                <BrowserRouter>

                    <Switch>
                        <Route {...routes.roomListPage()}>
                            <div>Room-list page</div>
                        </Route>
                        <Route >
                            <LoginPage />
                        </Route>
                    </Switch>

                </BrowserRouter>
            </BattleAssetsLoader>
        </Provider>
    );
};
