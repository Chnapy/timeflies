import React from 'react';
import { GameEngine } from './phaser/GameEngine';
import { UI } from './ui/UI';

export interface AppProps {
    onMount(gameWrapper: HTMLElement);
}

export class App extends React.PureComponent<AppProps> {
    private readonly gameWrapperRef: React.RefObject<HTMLDivElement>;

    constructor(props: AppProps) {
        super(props);
        this.gameWrapperRef = React.createRef();
    }

    render(): React.ReactElement {


        return <div>

            <div ref={this.gameWrapperRef} />

            <UI />

        </div>;
    }

    componentDidMount(): void {
        const gameWrapperElement = this.gameWrapperRef.current!;

        this.props.onMount(gameWrapperElement);
    }
}