import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { GameAction } from './action/GameAction';
import { UI } from './ui/UI';
import { UIState } from './ui/UIState';
import './app.css';

export interface AppProps {
    store: Store<UIState, GameAction>;
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

                    <UI />

                </div>
            </Provider>
        </React.StrictMode>;
    }

    componentDidMount(): void {
        const gameWrapperElement = this.gameWrapperRef.current!;

        const canvas = gameWrapperElement.firstElementChild as HTMLCanvasElement;

        this.props.onMount(gameWrapperElement, canvas);
    }
}
