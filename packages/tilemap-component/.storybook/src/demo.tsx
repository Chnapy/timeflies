import { ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { ArrayUtils, createPosition } from '@timeflies/common';
import * as PIXI from "pixi.js";
import { Loader, LoaderResource, Texture } from 'pixi.js';
import React from 'react';
import { Container, Sprite, Stage } from 'react-pixi-fiber';
import { TiledMap } from 'tiled-types';
import { TilemapComponent } from '../../src';

const loader = Loader.shared;

const getMapData = () => {

  const { map_json, map_img } = loader.resources;

  if (!map_json || !map_img) {
    return null;
  }

  return {
    mapSheet: map_json.data,
    mapTexture: {
      [ (map_json.data as TiledMap).tilesets[ 0 ].name ]: Texture.from(map_img.data)
    }
  };
};

export const Demo: React.FC = () => {
  return (
    <Stage key='foo-bar' options={{ backgroundColor: 0x10bb99, height: 650, width: 800 }}>
      <InnerDemo />
    </Stage>
  );
};

const InnerDemo: React.FC = () => {

  const [ data, setData ] = React.useState<{
    mapSheet: TiledMap;
    mapTexture: { [ k: string ]: Texture };
  } | null>(getMapData());

  const [ tilesRange, setTilesRange ] = React.useState<Record<string, boolean>>({ '8:8': true, '9:8': true, '10:8': true, '11:8': true });
  const [ pos, setPos ] = React.useState(createPosition(9, 8));

  React.useEffect(() => {

    if (!data) {

      loader.add([
        {
          name: 'map_json',
          url: 'fake/maps/map_dungeon.json'
        },
        {
          name: 'map_img',
          url: 'fake/maps/map_dungeon.png',
          loadType: LoaderResource.LOAD_TYPE.IMAGE
        }
      ])
        .load(() => {
          setData(getMapData());
        });

    }

  }, [ data ]);

  if (!data) {
    return null;
  }

  const tilesize = 16;

  return (
    <Container scale={2}>
      <ThemeProvider theme={appTheme}>
        <Container x={50}>
          <TilemapComponent
            {...data}
            onTileMouseHover={p => console.log(p)}
            tilesRange={tilesRange}
            tilesAction={{ '11:8': true, '11:9': true, '11:10': true }}
            tilesCurrentAction={{ '11:9': true, '10:9': true, '12:9': true }}
          >
            {{
              [ pos.id ]: <Sprite
                texture={PIXI.Texture.from('https://i.imgur.com/IaUrttj.png')}
                x={pos.x * tilesize} y={pos.y * tilesize} width={tilesize} height={tilesize}
              />
            }}
          </TilemapComponent>
          <Sprite
            texture={PIXI.Texture.from('https://i.imgur.com/IaUrttj.png')}
            x={0} y={0} width={tilesize} height={tilesize}
            interactive click={() => {
              setPos(createPosition(pos.x - 1, pos.y));
              setTilesRange(
                ArrayUtils.range(40).map(i => Math.floor(Math.random() * 10) + ':' + Math.floor(Math.random() * 10))
                  .reduce((acc, v) => {
                    acc[ v ] = true;
                    return acc;
                  }, {})
              );
            }}
          />
        </Container>
      </ThemeProvider>
    </Container>
  );
};
