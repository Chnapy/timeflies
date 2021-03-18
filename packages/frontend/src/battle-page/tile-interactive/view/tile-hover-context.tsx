import { Position } from '@timeflies/common';
import React from 'react';

type TileHoverContextValue = Position | null;

export const TileHoverContext = React.createContext<TileHoverContextValue>(null);
TileHoverContext.displayName = 'TileHoverContext';

export const TileHoverDispatchContext = React.createContext<React.Dispatch<TileHoverContextValue>>(undefined as any);
TileHoverDispatchContext.displayName = 'TileHoverDispatchContext';

export const TileHoverContextProvider: React.FC = ({ children }) => {
    const [ value, dispatch ] = React.useReducer((state: TileHoverContextValue, newState: TileHoverContextValue): TileHoverContextValue => {
        return newState?.id !== state?.id
            ? newState
            : state;
    }, null);

    return <TileHoverContext.Provider value={value}>
        <TileHoverDispatchContext.Provider value={dispatch}>
            {children}
        </TileHoverDispatchContext.Provider>
    </TileHoverContext.Provider>;
};

export const useTileHoverContext = () => React.useContext(TileHoverContext);
export const useTileHoverDispatchContext = () => React.useContext(TileHoverDispatchContext);
