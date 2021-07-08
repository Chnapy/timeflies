import React from 'react';
import { AudioContextProvider } from '@timeflies/app-ui';

export const OptionsContextProvider: React.FC = ({ children }) => {

    return (
        <AudioContextProvider>
            {children}
        </AudioContextProvider>
    );
};
