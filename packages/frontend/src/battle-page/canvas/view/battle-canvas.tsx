import { makeStyles } from '@material-ui/core';
import { AssetsContext, useAssetMap } from '@timeflies/assets-loader';
import { ContextBridge } from '@timeflies/context-bridge';
import React from 'react';
import { Stage } from 'react-pixi-fiber';
import { ReactReduxContext } from 'react-redux';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattleTilemap } from './battle-tilemap';
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
                        AssetsContext
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
                    <BattleViewport>
                        <BattleTilemap/>
                    </BattleViewport>
                </ContextBridge>
            )}
        </div>
    );
};
