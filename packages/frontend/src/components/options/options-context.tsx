import React from 'react';
import { MusicContextProvider } from '../../audio-engine/view/music-context';

export const OptionsContextProvider: React.FC = ({ children }) => {

    return (
        <MusicContextProvider>
            {children}
        </MusicContextProvider>
    );
};
