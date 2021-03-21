import { BattleFeedbackContextProvider } from '@timeflies/battle-feedback';
import React from 'react';
import { ActionPreviewContextProvider } from './action-preview/view/action-preview-context';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { BattleViewportContextProvider } from './canvas/view/battle-viewport-context';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { CharactersPositionsContextProvider } from './hud/character-hud/view/characters-positions-context';
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
                            <CharactersPositionsContextProvider>
                                <BattleViewportContextProvider>
                                    <BattleCanvas />

                                    <BattleHud />
                                </BattleViewportContextProvider>
                            </CharactersPositionsContextProvider>
                        </BattleFeedbackContextProvider>
                    </CycleEngineProvider>
                </ActionPreviewContextProvider>
            </RangeAreaContextProvider>
        </TileHoverContextProvider>
    </>;
};
