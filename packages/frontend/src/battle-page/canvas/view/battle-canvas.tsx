import { makeStyles, ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { AssetsContext } from '@timeflies/assets-loader';
import { ContextBridge } from '@timeflies/context-bridge';
import { SocketContext } from '@timeflies/socket-client';
import React from 'react';
import { Stage } from 'react-pixi-fiber';
import { ReactReduxContext } from 'react-redux';
import { ActionPreviewContext } from '../../action-preview/view/action-preview-context';
import { CycleEngineContext } from '../../cycle/view/cycle-engine-context';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { RangeAreaContext } from '../../range-area/view/range-area-context';
import { TileHoverContext, TileHoverDispatchContext } from '../../tile-interactive/view/tile-hover-context';
import { BattleTilemap } from '../tilemap/battle-tilemap';
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
                        SocketContext,
                        ReactReduxContext,
                        AssetsContext,
                        CycleEngineContext,
                        TileHoverContext,
                        TileHoverDispatchContext,
                        RangeAreaContext,
                        ActionPreviewContext,
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
