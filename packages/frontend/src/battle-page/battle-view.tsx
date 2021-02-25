import React from 'react';
import { ActionPreviewContextProvider } from './action-preview/view/action-preview-context';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { BattleHud } from './hud/view/battle-hud';
import { RangeAreaContextProvider } from './range-area/view/range-area-context';
import { TileHoverContextProvider } from './tile-interactive/view/tile-hover-context';

export const BattleView: React.FC = () => {
    return <>
        <TileHoverContextProvider>
            <RangeAreaContextProvider>
                <ActionPreviewContextProvider>
                    <CycleEngineProvider>
                        <BattleCanvas />

                        <BattleHud />
                    </CycleEngineProvider>
                </ActionPreviewContextProvider>
            </RangeAreaContextProvider>
        </TileHoverContextProvider>
    </>;
};
