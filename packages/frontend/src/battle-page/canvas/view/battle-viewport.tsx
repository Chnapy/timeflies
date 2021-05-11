import { IViewportOptions, Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import React from 'react';
import { CustomPIXIComponent, usePixiApp } from 'react-pixi-fiber';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useBattleViewportDispatchContext } from './battle-viewport-context';

// type Viewport is quite broken
type IViewport = PIXI.DisplayObject & Viewport;

type MovedEventData = {
    viewport: IViewport;
};

type ViewportComponentProps = IViewportOptions & {
    onMoved: (data: MovedEventData) => void;
};

const ViewportComponent = CustomPIXIComponent<IViewport, ViewportComponentProps>({
    customDisplayObject: props => {

        const viewport = new Viewport(props);

        return viewport as IViewport;
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
                wheel: false,
            })
            .scaled = 3;

        if (oldProps?.onMoved) {
            viewport.off('moved', oldProps.onMoved);
        }

        viewport.on('moved', newProps.onMoved);

        // for first render
        newProps.onMoved({ viewport });

        viewport.resize(newProps.screenWidth!, newProps.screenHeight!);
    },
    customWillDetach: viewport => {
        viewport.removeAllListeners();
    }
}, 'ViewportComponent');

const getScreenSize = ({ renderer }: PIXI.Application) => [ renderer.screen.width, renderer.screen.height ];

export const BattleViewport: React.FC = ({ children }) => {
    const app = usePixiApp();
    const tiledMapAssets = useTiledMapAssets();
    const viewportDispatch = useBattleViewportDispatchContext();

    const { renderer } = app;

    const [ screenSize, setScreenSize ] = React.useState(() => getScreenSize(app));

    const getWorldSize = (): IViewportOptions => {
        if (!tiledMapAssets) {
            return {};
        }

        const { width, height, tilewidth, tileheight } = tiledMapAssets.schema;

        return {
            worldWidth: tilewidth * width,
            worldHeight: tileheight * height
        };
    };

    const onMoved = ({ viewport }: MovedEventData) => viewportDispatch({
        dx: viewport.x,
        dy: viewport.y,
        scale: viewport.scale.x
    });

    React.useEffect(() => {
        const resizeListener = () => {
            setImmediate(() => {
                setScreenSize(getScreenSize(app));
            });
        };
        window.addEventListener('resize', resizeListener);

        return () => window.removeEventListener('resize', resizeListener);
    }, [ app ]);

    return (
        <ViewportComponent
            screenWidth={screenSize[ 0 ]}
            screenHeight={screenSize[ 1 ]}
            disableOnContextMenu={false}
            interaction={renderer.plugins.interaction}
            {...getWorldSize()}
            onMoved={onMoved}
        >
            {children}
        </ViewportComponent>
    );
};
