import { Position } from '@timeflies/common';
import React from 'react';
import { useComputeRangeArea } from '../hooks/use-compute-range-area';

type RangeAreaContextValue = {
    rangeArea: Position[];
};

const getRangeAreaContextInitialValue = (): RangeAreaContextValue => ({
    rangeArea: []
});

export const RangeAreaContext = React.createContext<RangeAreaContextValue>(getRangeAreaContextInitialValue());
RangeAreaContext.displayName = 'RangeAreaContext';

export const RangeAreaContextProvider: React.FC = ({ children }) => {
    const rangeArea = useComputeRangeArea();

    return <RangeAreaContext.Provider value={{ rangeArea }}>
        {children}
    </RangeAreaContext.Provider>;
};

export const useRangeAreaContext = () => React.useContext(RangeAreaContext);
