import React from 'react';
import { ActionAreaContextProvider } from './canvas/tilemap/action-area/view/action-area-context';
import { RangeAreaContextProvider } from './canvas/tilemap/range-area/view/range-area-context';
import { TileHoverContextProvider } from './canvas/tilemap/tile-hover/view/tile-hover-context';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { BattleHud } from './hud/view/battle-hud';

export const BattleView: React.FC = () => {
    return <>
        <TileHoverContextProvider>
            <RangeAreaContextProvider>
                <ActionAreaContextProvider>
                    <CycleEngineProvider>
                        <BattleCanvas />

                        <BattleHud />
                    </CycleEngineProvider>
                </ActionAreaContextProvider>
            </RangeAreaContextProvider>
        </TileHoverContextProvider>
    </>;
};
