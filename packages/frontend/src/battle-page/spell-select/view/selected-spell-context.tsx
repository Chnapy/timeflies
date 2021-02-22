import { SpellId } from '@timeflies/common';
import React from 'react';

type SelectedSpellContextValue = {
    selectedSpellId: SpellId | null;
};

const getSelectedSpellContextInitialValue = (): SelectedSpellContextValue => ({
    selectedSpellId: null
})

export const SelectedSpellContext = React.createContext<SelectedSpellContextValue>(getSelectedSpellContextInitialValue());
SelectedSpellContext.displayName = 'SelectedSpellContext';

export const SelectedSpellDispatchContext = React.createContext<React.Dispatch<SelectedSpellContextValue>>(undefined as any);
SelectedSpellDispatchContext.displayName = 'SelectedSpellDispatchContext';

export const SelectedSpellContextProvider: React.FC = ({ children }) => {
    const [ value, dispatch ] = React.useState(getSelectedSpellContextInitialValue);

    return <SelectedSpellContext.Provider value={value}>
        <SelectedSpellDispatchContext.Provider value={dispatch}>
            {children}
        </SelectedSpellDispatchContext.Provider>
    </SelectedSpellContext.Provider>;
};

export const useSelectedSpellContext = () => React.useContext(SelectedSpellContext);
export const useSelectedSpellDispatchContext = () => React.useContext(SelectedSpellDispatchContext);
