import { ObjectTyped } from '@timeflies/common';
import { Assets } from '@timeflies/static-assets';
import { Howl, Howler } from 'howler';
import React from 'react';

const audioContext = new AudioContext();
const unlockAudioContext = () => {
    if (audioContext.state !== "suspended") {
        return;
    }

    const events = [ "touchstart", "touchend", "mousedown", "keydown" ];

    const unlock = () => {
        audioContext.resume().then(clean);
    };

    const clean = () => events.forEach(e => document.body.removeEventListener(e, unlock));

    events.forEach(e => document.body.addEventListener(e, unlock, false));
};

type MusicContextValue = { [ key in Assets.MusicKey ]: Howl };

const MusicContext = React.createContext<MusicContextValue | null>(null);
MusicContext.displayName = 'MusicContext';

const storageMusicVolumeKey = 'options.music-volume';
const initialMusicVolume = Number(localStorage.getItem(storageMusicVolumeKey) ?? 0.2);

const MusicVolumeContext = React.createContext<number>(initialMusicVolume);
MusicVolumeContext.displayName = 'MusicVolumeContext';

const MusicVolumeDispatchContext = React.createContext<React.Dispatch<number>>(undefined as any);
MusicVolumeDispatchContext.displayName = 'MusicVolumeDispatchContext';

const enableMusicContext = (): MusicContextValue | null => {
    if (new AudioContext().state !== 'running') {
        return null;
    }

    const musicMap = ObjectTyped.entries(Assets.musics)
        .reduce((acc, [ key, musicPaths ]) => {

            const sound = new Howl({
                src: musicPaths,
                html5: true,
                loop: true
            });

            acc[ key ] = sound;

            return acc;
        }, {} as MusicContextValue);

    Howler.volume(initialMusicVolume);

    return musicMap;
};

export const MusicContextProvider: React.FC = ({ children }) => {
    const [ musicValue, musicDispatch ] = React.useState(enableMusicContext);
    const [ musicVolumeValue, musicVolumeDispatch ] = React.useState<number>(initialMusicVolume);

    React.useEffect(() => {
        unlockAudioContext();

        audioContext.onstatechange = () => {
            musicDispatch(enableMusicContext());
        };
    }, []);

    return <MusicContext.Provider value={musicValue}>

            <MusicVolumeContext.Provider value={musicVolumeValue}>
                <MusicVolumeDispatchContext.Provider value={musicVolumeDispatch}>

                    {children}

                </MusicVolumeDispatchContext.Provider>
            </MusicVolumeContext.Provider>

    </MusicContext.Provider>;
};

export const useMusicContext = () => React.useContext(MusicContext);

export const useMusicVolumeContext = () => React.useContext(MusicVolumeContext);

export const useMusicVolumeDispatch = () => {
    const dispatch = React.useContext(MusicVolumeDispatchContext);

    return (volume: number) => {
        Howler.volume(volume);
        localStorage.setItem(storageMusicVolumeKey, volume + '');

        dispatch(volume);
    };
};
