import React from 'react';
import { BattleCanvas } from './canvas/view/battle-canvas';
import { BattleHud } from './hud/view/battle-hud';

export const BattleView: React.FC = () => {

    return <>
        <BattleCanvas />

        <BattleHud />
    </>;
};
