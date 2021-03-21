import React from 'react';
import { shallowEqual } from 'react-redux';

export type BattleViewportContextValue = {
    dx: number;
    dy: number;
    scale: number;
};

const getInitialContextValue = (): BattleViewportContextValue => ({
    dx: 0,
    dy: 0,
    scale: 1
});

export const BattleViewportContext = React.createContext<BattleViewportContextValue>(getInitialContextValue());
BattleViewportContext.displayName = 'BattleViewportContext';

export const BattleViewportDispatchContext = React.createContext<React.Dispatch<BattleViewportContextValue>>(undefined as any);
BattleViewportDispatchContext.displayName = 'BattleViewportDispatchContext';

export const BattleViewportContextProvider: React.FC = ({ children }) => {
    const [ value, dispatch ] = React.useState<BattleViewportContextValue>(getInitialContextValue);
    React.useReducer((oldValue: BattleViewportContextValue, newValue: BattleViewportContextValue) => {

        return shallowEqual(oldValue, newValue)
            ? oldValue
            : newValue;
    }, getInitialContextValue());

    return <BattleViewportContext.Provider value={value}>
        <BattleViewportDispatchContext.Provider value={dispatch}>
            {children}
        </BattleViewportDispatchContext.Provider>
    </BattleViewportContext.Provider>;
};

export const useBattleViewportContext = () => React.useContext(BattleViewportContext);
export const useBattleViewportDispatchContext = () => React.useContext(BattleViewportDispatchContext);
