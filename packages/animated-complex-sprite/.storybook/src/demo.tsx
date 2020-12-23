import React from 'react';
import { Container, createStageClass } from 'react-pixi-fiber';
import { OutlineInfos } from '../../src';
import { CanvasProps, InnerCanvas, SpriteConfig } from './inner-canvas';

const Stage = createStageClass();

export const Demo = () => {
    const [ state, setState ] = React.useState<Omit<CanvasProps, 'pos'>>({
        run: true,
        state: {
            role: 'tacka',
            state: 'walk',
            orientation: 'right'
        }
    });
    const [ pos, setPos ] = React.useState({ x: 4 * 16, y: 3 * 16 });

    const createButton = (name: string, partial: Partial<SpriteConfig>, run: boolean = state.run, outline: OutlineInfos = state.outline) => (
        <button
            onClick={() => {
                console.time('state ' + name)
                setState({
                    ...state,
                    run,
                    state: {
                        ...state.state,
                        ...partial
                    },
                    outline
                });
                console.timeEnd('state ' + name)
            }}
        >{name}</button>
    );

    return (
        <div>
            <div>
                {createButton('stop', {}, false)}
                {createButton('play', {}, true)}
                {createButton('tacka', { role: 'tacka' })}
                {createButton('meti', { role: 'meti' })}
                {createButton('vemo', { role: 'vemo' })}
                {createButton('idle', { state: 'idle' })}
                {createButton('walk', { state: 'walk' })}
                {createButton('attack', { state: 'attack' })}
                {createButton('hit', { state: 'hit' })}
                {createButton('left', { orientation: 'left' })}
                {createButton('right', { orientation: 'right' })}
                {createButton('top', { orientation: 'top' })}
                {createButton('bottom', { orientation: 'bottom' })}
                {createButton('add outline', {  }, undefined, { thickness: 2, color: 0xFFFFFF })}
                {createButton('remove outline', {  }, undefined, { thickness: 0, color: 0x000000 })}

                <button
                    onClick={() => {
                        setPos({ x: pos.x - 16, y: pos.y });
                    }}
                >change-position</button>
            </div>

            <div>
                <Stage options={{ height: 600, width: 800 }}>
                    <Container scale={3}>
                        <InnerCanvas {...state} pos={pos} />
                    </Container>
                </Stage>
            </div>
        </div>
    );
};
