import React from 'react';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { CycleEngineProvider } from './cycle/view/cycle-engine-context';
import { BattleHud } from './hud/view/battle-hud';
import { SelectedSpellContextProvider } from './spell-select/view/selected-spell-context';

export const BattleView: React.FC = () => {
    return <>
        <SelectedSpellContextProvider>
            <CycleEngineProvider>
                <BattleCanvas />

                <BattleHud />
            </CycleEngineProvider>
        </SelectedSpellContextProvider>
    </>;
};
