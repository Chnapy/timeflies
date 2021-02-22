import React from 'react';
import { RangeAreaContextProvider } from './canvas/tilemap/range-area/view/range-area-context';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { BattleHud } from './hud/view/battle-hud';

export const BattleView: React.FC = () => {
    return <>
        <RangeAreaContextProvider>
            <CycleEngineProvider>
                <BattleCanvas />

                <BattleHud />
            </CycleEngineProvider>
        </RangeAreaContextProvider>
    </>;
};
