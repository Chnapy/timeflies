import CssBaseline from '@material-ui/core/CssBaseline';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { GameAction } from './action/game-action/GameAction';
import './app.css';
import { GameState } from './game-state';
import { appTheme } from './ui/app-theme';
import { GameUI } from './ui/game-ui';

export interface AppProps {
    store: Store<GameState, GameAction>;
    onMount(gameWrapper: HTMLElement, canvas: HTMLCanvasElement);
}

export class App extends React.Component<AppProps> {
    private readonly gameWrapperRef: React.RefObject<HTMLDivElement>;

    constructor(props: AppProps) {
        super(props);
        this.gameWrapperRef = React.createRef();
    }

    shouldComponentUpdate() {
        return false;
    }

    render(): React.ReactElement {
        const { store } = this.props;

        return <React.StrictMode>
            <Provider store={store}>
                <ThemeProvider theme={appTheme}>
                    <CssBaseline />
                    <div>

                        <div ref={this.gameWrapperRef} style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100vh',
                            // minHeight: '400px',
                            width: '100vw',
                            // minWidth: '600px'
                        }}>
                            <canvas />
                        </div>

                        <GameUI />

                    </div>
                </ThemeProvider>
            </Provider>
        </React.StrictMode>;
    }

    componentDidMount(): void {
        const gameWrapperElement = this.gameWrapperRef.current!;

        const canvas = gameWrapperElement.firstElementChild as HTMLCanvasElement;

        this.props.onMount(gameWrapperElement, canvas);
    }
}
