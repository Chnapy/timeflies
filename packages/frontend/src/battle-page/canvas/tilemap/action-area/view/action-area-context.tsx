import { Position } from '@timeflies/common';
import React from 'react';
import { useComputeActionArea } from '../hooks/use-compute-action-area';

type ActionAreaContextValue = {
    actionArea: Position[];
};

const getActionAreaContextInitialValue = (): ActionAreaContextValue => ({
    actionArea: []
});

export const ActionAreaContext = React.createContext<ActionAreaContextValue>(getActionAreaContextInitialValue());
ActionAreaContext.displayName = 'ActionAreaContext';

export const ActionAreaContextProvider: React.FC = ({ children }) => {
    const actionArea = useComputeActionArea();

    return <ActionAreaContext.Provider value={{ actionArea }}>
        {children}
    </ActionAreaContext.Provider>;
};

export const useActionAreaContext = () => React.useContext(ActionAreaContext);
