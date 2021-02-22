import { Layer } from '@timeflies/tilemap-utils';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { TilemapCharacters, TilemapCommonProps } from './tilemap-common-props';
import { TilemapLayer, TilemapLayerProps } from './tilemap-layer';
import { TilemapTilesStates, TilemapTilesStatesProps } from './tilemap-tiles-states';

export type TilemapComponentProps = TilemapCommonProps
    & Pick<TilemapTilesStatesProps, 'tilesRange' | 'tilesAction' | 'tilesCurrentAction'>
    & {
        children: TilemapCharacters;
    };

export const TilemapComponent: React.FC<TilemapComponentProps> = ({
    mapSheet, mapTexture, onTileMouseHover: onTileMouseHoverRaw, tilesRange, tilesAction, tilesCurrentAction, children
}) => {
    const onTileMouseHoverRef = React.useRef<TilemapComponentProps[ 'onTileMouseHover' ]>(onTileMouseHoverRaw);
    onTileMouseHoverRef.current = onTileMouseHoverRaw;

    const onTileMouseHover = React.useCallback<TilemapComponentProps[ 'onTileMouseHover' ]>((...args) => {
        onTileMouseHoverRef.current(...args);
    }, [ onTileMouseHoverRef ]);

    const commonProps: TilemapCommonProps = {
        mapSheet, mapTexture, onTileMouseHover
    };

    const backgroundLayer = Layer.getTilelayer('background', mapSheet);
    const obstaclesLayer = Layer.getTilelayer('obstacles', mapSheet);
    const foregroundLayerList = Layer.getForegroundLayers(mapSheet);

    const renderLayer = (props: Pick<TilemapLayerProps, 'layer' | 'interactive' | 'characters'>) => (
        <TilemapLayer
            key={props.layer.name}
            {...commonProps}
            {...props}
        />
    );

    const background = renderLayer({
        layer: backgroundLayer,
        interactive: true
    });

    const obstaclesAndEntities = renderLayer({
        layer: obstaclesLayer,
        characters: children
    });

    const foreground = foregroundLayerList.map(layer => renderLayer({ layer }));

    return <Container interactive mouseout={() => onTileMouseHover(null)}>

        {background}

        <TilemapTilesStates
            backgroundLayer={backgroundLayer}
            mapSheet={mapSheet}
            tilesRange={tilesRange}
            tilesAction={tilesAction}
            tilesCurrentAction={tilesCurrentAction}
        />

        {obstaclesAndEntities}
        {foreground}

    </Container>;
};
