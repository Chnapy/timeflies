import { ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { AssetsLoader, AssetsLoaderMap, useAssetMap } from '@timeflies/assets-loader';
import { MapInfos } from '@timeflies/socket-messages';
import { TilemapComponent } from '@timeflies/tilemap-component';
import React from 'react';
import { Container, Stage } from 'react-pixi-fiber';
import { imagesLinksToTextures } from '../../battle-page/canvas/tilemap/battle-tilemap';

type RoomMapButtonImageProps = {
    mapInfos: Pick<MapInfos, 'name' | 'schemaLink'>;
    width: number;
    height: number;
};

export const RoomMapButtonImage: React.FC<RoomMapButtonImageProps> = React.memo(({ mapInfos, width, height }) => {
    const [ assetsLoaderProps ] = React.useState<AssetsLoaderMap>({ spritesheets: {}, maps: { [ mapInfos.name ]: mapInfos.schemaLink } });

    return (
        <Stage options={{ width, height, backgroundAlpha: 0 }}>
            <ThemeProvider theme={appTheme}>
                <AssetsLoader {...assetsLoaderProps}>
                    <RoomMapButtonImageInner mapName={mapInfos.name} width={width} height={height} />
                </AssetsLoader>
            </ThemeProvider>
        </Stage>
    );
});

type RoomMapButtonImageInnerProps = Pick<RoomMapButtonImageProps, 'width' | 'height'> & {
    mapName: string;
};

const RoomMapButtonImageInner: React.FC<RoomMapButtonImageInnerProps> = React.memo(({ mapName, width, height }) => {
    const mapAssets = useAssetMap(mapName);
    if (!mapAssets) {
        return null;
    }

    const { schema } = mapAssets;

    const scale = Math.min(
        width / (schema.width * schema.tilewidth),
        height / (schema.height * schema.tileheight)
    );

    return <Container scale={scale}>
        <TilemapComponent
            mapSheet={schema}
            mapTexture={imagesLinksToTextures(mapAssets.images)}
            tilesRange={{}}
            tilesAction={{}}
            tilesCurrentAction={{}}
            onTileMouseHover={() => { }}
        >
            {{}}
        </TilemapComponent>
    </Container>;
});
