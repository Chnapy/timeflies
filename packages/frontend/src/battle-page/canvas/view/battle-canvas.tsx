import { makeStyles } from '@material-ui/core';
import { useAssetMap } from '@timeflies/assets-loader';
import { TilemapComponent } from '@timeflies/tilemap-component';
import { Texture } from 'pixi.js';
import React from 'react';
import { Container, Stage } from 'react-pixi-fiber';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

const useStyles = makeStyles(() => ({
    root: {
        height: '100vh'
    }
}));

const imagesLinksToTextures = (links: Record<string, string>) => {
    return Object.entries(links).reduce<Record<string, Texture>>((acc, [ key, source ]) => {
        acc[ key ] = Texture.from(source);
        return acc;
    }, {});
};

export const BattleCanvas: React.FC = () => {
    const classes = useStyles();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapAssets = useAssetMap(tiledMapName);

    return (
        <div ref={rootRef} className={classes.root}>
            {tiledMapAssets && rootRef.current && <Stage options={{
                resizeTo: rootRef.current, 
            }}>
                <Container scale={3}>
                    <TilemapComponent
                        mapSheet={tiledMapAssets.schema}
                        mapTexture={imagesLinksToTextures(tiledMapAssets.images)}
                    >
                        {{}}
                    </TilemapComponent>
                </Container>
            </Stage>}
        </div>
    );
};
