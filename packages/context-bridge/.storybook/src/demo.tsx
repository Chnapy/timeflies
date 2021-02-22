import * as PIXI from "pixi.js";
import React from 'react';
import { Container, Sprite, Stage } from 'react-pixi-fiber';
import { ContextBridge } from '../../src';

const PositionContext = React.createContext({ x: 150, y: 150 });

export const Demo: React.FC = () => {
  const [ value, setValue ] = React.useState({ x: 150, y: 150 });

  return <PositionContext.Provider value={value}>
    <button onClick={() => setValue({ x: value.x - 10, y: value.y - 10 })}>
      update
      </button>
    <InnerDemo />
  </PositionContext.Provider>
};

export const InnerDemo: React.FC = () => {

  const { x, y } = React.useContext(PositionContext);

  return (
    <div>
      <div>
        Position [{x} - {y}]
      </div>
      <ContextBridge
        contexts={[ PositionContext ]}
        barrierRender={(children) => (
          <Stage key='foo' options={{ height: 600, width: 800 }}>
            {children}
          </Stage>
        )}
      >
        <Canvas />
      </ContextBridge>
    </div>
  );
};

const Canvas: React.FC = () => {

  const { x, y } = React.useContext(PositionContext);

  React.useEffect(() => {
    console.log('MOUNT');
  }, []);

  React.useEffect(() => {
    console.log('UPDATE');
  });

  return (
    <Container>
      <Sprite
        texture={PIXI.Texture.from('https://i.imgur.com/IaUrttj.png')}
        x={x} y={y}
      />
    </Container>
  );
};
