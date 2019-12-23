import React from 'react';
import { Game } from './phaser/Game';
import { UI } from './ui/UI';

export class App extends React.PureComponent {
    private readonly gameWrapperRef: React.RefObject<HTMLDivElement>;
    private game?: Game;

    constructor(props: {}) {
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

        this.game = new Game(gameWrapperElement);
    }
}