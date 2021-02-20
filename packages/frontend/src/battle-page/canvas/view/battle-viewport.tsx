import { useAssetMap } from '@timeflies/assets-loader';
import { Viewport, ViewportOptions } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import React from 'react';
import { CustomPIXIComponent, usePixiApp } from 'react-pixi-fiber';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

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
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapSchema = useAssetMap(tiledMapName);

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
        if (!tiledMapSchema) {
            return {};
        }

        const { width, height, tilewidth, tileheight } = tiledMapSchema.schema;

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
