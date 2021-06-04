import { BattleFeedbackContextProvider } from '@timeflies/battle-feedback';
import React from 'react';
import { ActionPreviewContextProvider } from './action-preview/view/action-preview-context';
import { BattleListeners } from './battle-listeners';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { BattleViewportContextProvider } from './canvas/view/battle-viewport-context';
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
                        <BattleFeedbackContextProvider value={{ previewEnabled: true }}>
                            <BattleViewportContextProvider>
                                <BattleListeners />

                                <BattleCanvas />

                                <BattleHud />
                            </BattleViewportContextProvider>
                        </BattleFeedbackContextProvider>
                    </CycleEngineProvider>
                </ActionPreviewContextProvider>
            </RangeAreaContextProvider>
        </TileHoverContextProvider>
    </>;
};
