import PIXI from 'pixi.js';

export interface GameCanvas {
}

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement) => {

    const canvas = new PIXI.Application({
        view,
        resizeTo: parent
    });

    return {
    };
};
