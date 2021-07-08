import React from 'react';
import { musicContextList, MusicContextProvider } from './music-context';
import { soundContextList, SoundContextProvider } from './sound-context';

export const audioContextList = [
    ...musicContextList,
    ...soundContextList
];

export const AudioContextProvider: React.FC = ({ children }) => (
    <MusicContextProvider>
        <SoundContextProvider>
            {children}
        </SoundContextProvider>
    </MusicContextProvider>
);
