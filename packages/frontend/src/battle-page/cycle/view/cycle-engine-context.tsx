import { createCycleEngine, CycleEngine } from '@timeflies/cycle-engine';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useCycleListener } from '../hooks/use-cycle-listener';
import { useCycleLogic } from '../hooks/use-cycle-logic';
import { BattleTurnEndAction } from '../store/cycle-actions';

export const CycleEngineContext = React.createContext<CycleEngine | null>(null);
CycleEngineContext.displayName = 'CycleEngineContext';

const CycleEngineLogic: React.FC = () => {
    useCycleLogic();
    useCycleListener();

    return null;
};

export const CycleEngineProvider: React.FC = ({ children }) => {
    const turnsOrder = useBattleSelector(battle => battle.turnsOrder);
    const charactersDurations = useBattleSelector(battle => battle.currentCharacters.actionTime);
    const dispatch = useDispatch();

    const createEngine = () => createCycleEngine({
        charactersList: turnsOrder,
        charactersDurations,
        listeners: {
            turnEnd: () => {
                dispatch(BattleTurnEndAction());
            }
        }
    });

    const [ cycleEngine ] = React.useState<CycleEngine>(createEngine);

    return <CycleEngineContext.Provider value={cycleEngine}>
        <CycleEngineLogic />
        {children}
    </CycleEngineContext.Provider>;
};

export const useCycleEngine = () => {
    const cycleEngine = React.useContext(CycleEngineContext);

    if (!cycleEngine) {
        throw new Error('cycleEngine context is null');
    }

    return cycleEngine;
};
