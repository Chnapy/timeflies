import { useAssetMap } from '@timeflies/assets-loader';
import { Viewport, ViewportOptions } from 'pixi-viewport';
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

export const BattleViewport: React.FC = ({ children }) => {
    const app = usePixiApp();
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapSchema = useAssetMap(tiledMapName);

    const { renderer } = app;

    const getScreenSize = () => [ renderer.screen.width, renderer.screen.height ];
    const [ screenSize, setScreenSize ] = React.useState(getScreenSize);

    React.useEffect(() => {
        const resizeListener = () => {
            setImmediate(() => {
                setScreenSize(getScreenSize());
            });
        };
        window.addEventListener('resize', resizeListener);

        return () => window.removeEventListener('resize', resizeListener);
    }, []);

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
