import { createPosition } from '@timeflies/shared';
import { TilemapComponent } from '@timeflies/tilemap-component';
import * as PIXI from "pixi.js";
import { Loader, LoaderResource, Texture } from 'pixi.js';
import React from 'react';
import { Container, Sprite, Stage } from 'react-pixi-fiber';
import { TiledMap } from 'tiled-types';

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
          url: 'assets/map_dungeon.json'
        },
        {
          name: 'map_img',
          url: 'assets/map_dungeon.png',
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
      <TilemapComponent {...data}>
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
    </Container>
  </Stage>;
};
