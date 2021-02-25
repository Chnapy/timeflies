import { Viewport, ViewportOptions } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import React from 'react';
import { CustomPIXIComponent, usePixiApp } from 'react-pixi-fiber';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';

const ViewportComponent = CustomPIXIComponent<Viewport, ViewportOptions>({
    customDisplayObject: props => {

        const viewport = new Viewport(props);

        return viewport;
    },
    customApplyProps: function (this: { applyDisplayObjectProps: (...args: any[]) => void }, viewport, oldProps, newProps) {

        this.applyDisplayObjectProps(oldProps, newProps);

        viewport
            .clamp({
                direction: 'all',
                bottom: -100,
                left: -100
            })
            .drag({
                wheel: false
            })
            .scale.set(3);

        viewport.resize(newProps.screenWidth!, newProps.screenHeight!);
    }
}, 'ViewportComponent');

const getScreenSize = ({ renderer }: PIXI.Application) => [ renderer.screen.width, renderer.screen.height ];

export const BattleViewport: React.FC = ({ children }) => {
    const app = usePixiApp();
    const tiledMapAssets = useTiledMapAssets();

    const { renderer } = app;

    const [ screenSize, setScreenSize ] = React.useState(() => getScreenSize(app));

    React.useEffect(() => {
        const resizeListener = () => {
            setImmediate(() => {
                setScreenSize(getScreenSize(app));
            });
        };
        window.addEventListener('resize', resizeListener);

        return () => window.removeEventListener('resize', resizeListener);
    }, [ app ]);

    const getWorldSize = (): ViewportOptions => {
        if (!tiledMapAssets) {
            return {};
        }

        const { width, height, tilewidth, tileheight } = tiledMapAssets.schema;

        return {
            worldWidth: tilewidth * width,
            worldHeight: tileheight * height
        };
    };

    return (
        <ViewportComponent
            screenWidth={screenSize[ 0 ]}
            screenHeight={screenSize[ 1 ]}
            disableOnContextMenu={false}
            interaction={renderer.plugins.interaction}
            {...getWorldSize()}
        >
            {children}
        </ViewportComponent>
    );
};
