import { makeStyles, ThemeProvider } from '@material-ui/core';
import { appTheme } from '@timeflies/app-ui';
import { AssetsContext, useAssetMap } from '@timeflies/assets-loader';
import { ContextBridge } from '@timeflies/context-bridge';
import React from 'react';
import { Stage } from 'react-pixi-fiber';
import { ReactReduxContext } from 'react-redux';
import { CycleEngineContext } from '../../cycle/view/cycle-engine-context';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
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
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    const tiledMapAssets = useAssetMap(tiledMapName);

    return (
        <div ref={rootRef} className={classes.root}>
            {tiledMapAssets && rootRef.current && (
                <ContextBridge
                    contexts={[
                        ReactReduxContext,
                        AssetsContext,
                        CycleEngineContext,
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
