import React from 'react';
import { Provider } from 'react-redux';
import { Action, Store } from 'redux';
import { GameState } from './game-state';
import { GameUI } from './ui/game-ui';
import { UIProvider } from './ui/ui-provider';

export interface AppProps {
    store: Store<GameState, Action>;
    onMount(gameWrapper: HTMLElement, canvas: HTMLCanvasElement);
}

export const App: React.FC<AppProps> = ({ store, onMount }) => {

    const gameWrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const gameWrapperElement = gameWrapperRef.current!;

        const canvas = gameWrapperElement.firstElementChild as HTMLCanvasElement;

        onMount(gameWrapperElement, canvas);
    }, [ onMount ]);

    return <React.StrictMode>
        <Provider store={store}>
            <UIProvider>
                <div>

                    <div ref={gameWrapperRef} style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100vh',
                        width: '100vw',
                    }}>
                        <canvas />
                    </div>

                    <GameUI />

                </div>
            </UIProvider>
        </Provider>
    </React.StrictMode>;
};
