import React from 'react';
import { MusicContextProvider, SoundContextProvider } from '@timeflies/app-ui';

export const OptionsContextProvider: React.FC = ({ children }) => {

    return (
        <MusicContextProvider>
            <SoundContextProvider>
                {children}
            </SoundContextProvider>
        </MusicContextProvider>
    );
};
