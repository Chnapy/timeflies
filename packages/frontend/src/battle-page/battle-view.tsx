import React from 'react';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { BattleHud } from './hud/view/battle-hud';

export const BattleView: React.FC = () => {
    return <>
        <CycleEngineProvider>
            <BattleCanvas />

            <BattleHud />
        </CycleEngineProvider>
    </>;
};
