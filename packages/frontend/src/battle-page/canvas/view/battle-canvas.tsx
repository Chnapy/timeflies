import { makeStyles, ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { AssetsContext } from '@timeflies/assets-loader';
import { ContextBridge } from '@timeflies/context-bridge';
import React from 'react';
import { Stage } from 'react-pixi-fiber';
import { ReactReduxContext } from 'react-redux';
import { CycleEngineContext } from '../../cycle/view/cycle-engine-context';
import { useTiledMapAssets } from '../../hooks/use-tiled-map-assets';
import { BattleTilemap } from '../tilemap/battle-tilemap';
import { RangeAreaContext } from '../tilemap/range-area-context';
import { BattleViewport } from './battle-viewport';

const useStyles = makeStyles(() => ({
    root: {
        height: '100vh'
    }
}));

export const BattleCanvas: React.FC = () => {
    const classes = useStyles();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const tiledMapAssets = useTiledMapAssets();

    return (
        <div ref={rootRef} className={classes.root}>
            {tiledMapAssets && rootRef.current && (
                <ContextBridge
                    contexts={[
                        ReactReduxContext,
                        AssetsContext,
                        CycleEngineContext,
                        RangeAreaContext
                    ]}
                    barrierRender={children => {
                        return (
                            <Stage options={{
                                resizeTo: rootRef.current!,
                            }}>
                                {children}
                            </Stage>
                        );
                    }}
                >
                    <ThemeProvider theme={appTheme}>
                        <BattleViewport>
                            <BattleTilemap />
                        </BattleViewport>
                    </ThemeProvider>
                </ContextBridge>
            )}
        </div>
    );
};
