import React from 'react';
import { Store } from 'redux';
import { UI } from './ui/UI';
import { Provider } from 'react-redux';
import { UIState } from './ui/UIState';
import { GameAction } from './action/GameAction';

export interface AppProps {
    store: Store<UIState, GameAction>;
    onMount(gameWrapper: HTMLElement);
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

        return <Provider store={store}>
            <div>

                <div ref={this.gameWrapperRef} />

                <UI />

            </div>
        </Provider>;
    }

    componentDidMount(): void {
        const gameWrapperElement = this.gameWrapperRef.current!;

        this.props.onMount(gameWrapperElement);
    }
}