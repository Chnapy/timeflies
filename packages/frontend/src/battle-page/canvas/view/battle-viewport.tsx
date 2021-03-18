import { Viewport, ViewportOptions } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import React from 'react';
import { CustomPIXIComponent, usePixiApp } from 'react-pixi-fiber';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useCharactersPositionsDispatchContext } from '../../hud/character-hud/view/characters-positions-context';

type ViewportComponentProps = ViewportOptions & {
    charactersPositionsDispatch: () => void;
};

const ViewportComponent = CustomPIXIComponent<Viewport, ViewportComponentProps>({
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
                wheel: false,
            })
            .scale.set(3);

        if (oldProps?.charactersPositionsDispatch) {
            viewport.off('zoomed-end', oldProps.charactersPositionsDispatch);
            viewport.off('drag-end', oldProps.charactersPositionsDispatch);
        }

        viewport.on('zoomed-end', newProps.charactersPositionsDispatch);
        viewport.on('drag-end', newProps.charactersPositionsDispatch);

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
    const charactersPositionsDispatch = useCharactersPositionsDispatchContext();

    const { renderer } = app;

    const [ screenSize, setScreenSize ] = React.useState(() => getScreenSize(app));

    React.useEffect(() => {
        const resizeListener = () => {
            setImmediate(() => {
                setScreenSize(getScreenSize(app));
                charactersPositionsDispatch();
            });
        };
        window.addEventListener('resize', resizeListener);

        setImmediate(charactersPositionsDispatch);

        return () => window.removeEventListener('resize', resizeListener);
    }, [ app, charactersPositionsDispatch ]);

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
            charactersPositionsDispatch={charactersPositionsDispatch}
        >
            {children}
        </ViewportComponent>
    );
};
