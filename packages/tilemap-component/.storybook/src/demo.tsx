import { ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { createPosition } from '@timeflies/common';
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

  const [ data, setData ] = React.useState<{
    mapSheet: TiledMap;
    mapTexture: { [ k: string ]: Texture };
  } | null>(getMapData());

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

  const pos = createPosition(9, 8);

  const tilesize = 16;

  return <Stage options={{ backgroundColor: 0x10bb99, height: 650, width: 800 }}>
    <Container scale={2}>
      <ThemeProvider theme={appTheme}>
        <TilemapComponent
          {...data}
          onTileMouseHover={console.log}
          tilesRange={[ '8:8', '9:8', '10:8', '11:8' ]}
          tilesAction={[ '11:8', '11:9', '11:10' ]}
          tilesCurrentAction={[ '11:9', '10:9', '12:9' ]}
        >
          {{
            [ pos.id ]: {
              id: 'foo',
              sprite: <Sprite
                texture={PIXI.Texture.from('https://i.imgur.com/IaUrttj.png')}
                x={pos.x * tilesize} y={pos.y * tilesize} width={tilesize} height={tilesize}
              />
            }
          }}
        </TilemapComponent>
      </ThemeProvider>
    </Container>
  </Stage>;
};
