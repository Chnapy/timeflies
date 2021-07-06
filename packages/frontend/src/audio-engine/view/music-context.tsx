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

type MusicContextValue = { [ key in Assets.MusicKey ]: Howl[] };

type MusicCurrent = {
    musicKey: Assets.MusicKey;
    index: number;
    history: { [ key in Assets.MusicKey ]: number };
};

const MusicContext = React.createContext<MusicContextValue | null>(null);
MusicContext.displayName = 'MusicContext';

const storageMusicVolumeKey = 'options.music-volume';
const initialMusicVolume = Number(localStorage.getItem(storageMusicVolumeKey) ?? 0.2);

const MusicVolumeContext = React.createContext<number>(initialMusicVolume);
MusicVolumeContext.displayName = 'MusicVolumeContext';

const MusicVolumeDispatchContext = React.createContext<React.Dispatch<number>>(undefined as any);
MusicVolumeDispatchContext.displayName = 'MusicVolumeDispatchContext';

const MusicCurrentContext = React.createContext<MusicCurrent | null>(null);
MusicCurrentContext.displayName = 'MusicCurrentContext';

const MusicCurrentDispatchContext = React.createContext<React.Dispatch<Omit<MusicCurrent, 'history'>>>(undefined as any);
MusicCurrentDispatchContext.displayName = 'MusicCurrentDispatchContext';

const enableMusicContext = (): MusicContextValue | null => {
    if (![ audioContext.state, new AudioContext().state ].includes('running')) {
        return null;
    }

    const musicMap = ObjectTyped.entries(Assets.musics)
        .reduce((acc, [ key, musicList ]) => {

            const musics = musicList.map(musicPaths => new Howl({
                src: musicPaths,
                html5: true,
                loop: true
            }));

            acc[ key ] = musics;

            return acc;
        }, {} as MusicContextValue);

    Howler.volume(initialMusicVolume);

    return musicMap;
};

export const MusicContextProvider: React.FC = ({ children }) => {
    const [ musicValue, musicDispatch ] = React.useState(enableMusicContext);
    const [ musicVolumeValue, musicVolumeDispatch ] = React.useState<number>(initialMusicVolume);

    const [ musicCurrentValue, musicCurrentDispatch ] = React.useReducer((prevMusicCurrent: MusicCurrent | null, nextMusicCurrent: Omit<MusicCurrent, 'history'>) => {
        if (!nextMusicCurrent) {
            return null;
        }

        return {
            ...nextMusicCurrent,
            history: {
                menu: -1,
                battle: -1,
                ...prevMusicCurrent?.history,
                [ nextMusicCurrent.musicKey ]: nextMusicCurrent.index
            }
        };
    }, null);

    React.useEffect(() => {
        unlockAudioContext();

        audioContext.onstatechange = () => {
            musicDispatch(enableMusicContext());
        };
    }, []);

    return <MusicContext.Provider value={musicValue}>

        <MusicVolumeContext.Provider value={musicVolumeValue}>
            <MusicVolumeDispatchContext.Provider value={musicVolumeDispatch}>

                <MusicCurrentContext.Provider value={musicCurrentValue}>
                    <MusicCurrentDispatchContext.Provider value={musicCurrentDispatch}>

                        {children}

                    </MusicCurrentDispatchContext.Provider>
                </MusicCurrentContext.Provider>

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

export const useMusicCurrentContext = () => React.useContext(MusicCurrentContext);

export const useMusicCurrentDispatch = () => React.useContext(MusicCurrentDispatchContext);
