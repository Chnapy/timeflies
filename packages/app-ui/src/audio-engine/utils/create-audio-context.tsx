import { ObjectTyped } from '@timeflies/common';
import { Howl } from 'howler';
import React from 'react';

const audioContext = new globalThis.AudioContext();
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
unlockAudioContext();

type AudioAssets = { [ k in string ]: string[][] };

type CreateAudioContextProps<A extends AudioAssets> = {
    contextsNamePrefix: string;
    storageAudioVolumeKeyPrefix: string;
    defaultAudioVolume: number;
    assets: A;
    loop?: boolean;
};

export const createAudioContext = <A extends AudioAssets>({
    contextsNamePrefix,
    storageAudioVolumeKeyPrefix,
    defaultAudioVolume,
    assets,
    loop,
}: CreateAudioContextProps<A>) => {
    type K = keyof A;

    type AudioContextValue = { [ key in K ]: Howl[] };

    type AudioCurrent = {
        currentKey: K;
        index: number;
        history: { [ key in K ]?: number };
    };

    const AudioContext = React.createContext<AudioContextValue | null>(null);
    AudioContext.displayName = `${contextsNamePrefix}Context`;

    const storageAudioVolumeKey = `options.${storageAudioVolumeKeyPrefix}-volume`;
    const initialAudioVolume = Number(localStorage.getItem(storageAudioVolumeKey) ?? defaultAudioVolume);

    const AudioVolumeContext = React.createContext<number>(initialAudioVolume);
    AudioVolumeContext.displayName = `${contextsNamePrefix}VolumeContext`;

    const AudioVolumeDispatchContext = React.createContext<React.Dispatch<number>>(undefined as any);
    AudioVolumeDispatchContext.displayName = `${contextsNamePrefix}VolumeDispatchContext`;

    const AudioCurrentContext = React.createContext<AudioCurrent | null>(null);
    AudioCurrentContext.displayName = `${contextsNamePrefix}CurrentContext`;

    const AudioCurrentDispatchContext = React.createContext<React.Dispatch<Omit<AudioCurrent, 'history'>>>(undefined as any);
    AudioCurrentDispatchContext.displayName = `${contextsNamePrefix}CurrentDispatchContext`;

    const contextList = [ AudioContext, AudioVolumeContext, AudioVolumeDispatchContext, AudioCurrentContext, AudioCurrentDispatchContext ];

    const applyAudioVolume = (audioContext: AudioContextValue, volume: number) => Object.values<Howl[]>(audioContext)
        .forEach(audioList => audioList
            .forEach(audio => audio.volume(volume))
        );

    const enableAudioContext = (): AudioContextValue | null => {
        if (![ audioContext.state, new globalThis.AudioContext().state ].includes('running')) {
            return null;
        }

        const audioContextValue = ObjectTyped.entries(assets)
            .reduce((acc, [ key, audioList ]) => {

                const audios = audioList.map(audioPaths => new Howl({
                    src: audioPaths,
                    html5: true,
                    volume: initialAudioVolume,
                    loop
                }));

                acc[ key ] = audios;

                return acc;
            }, {} as AudioContextValue);

        return audioContextValue;
    };

    const AudioContextProvider: React.FC = ({ children }) => {
        const [ audioValue, audioDispatch ] = React.useState(enableAudioContext);
        const [ audioVolumeValue, audioVolumeDispatch ] = React.useState<number>(initialAudioVolume);

        const [ audioCurrentValue, audioCurrentDispatch ] = React.useReducer((prevAudioCurrent: AudioCurrent | null, nextAudioCurrent: Omit<AudioCurrent, 'history'>) => {
            if (!nextAudioCurrent) {
                return null;
            }

            return {
                ...nextAudioCurrent,
                history: {
                    ...prevAudioCurrent?.history,
                    [ nextAudioCurrent.currentKey ]: nextAudioCurrent.index
                } as AudioCurrent[ 'history' ]
            };
        }, null);

        React.useEffect(() => {
            audioContext.addEventListener('statechange', () => {
                audioDispatch(enableAudioContext());
            });
        }, []);

        return <AudioContext.Provider value={audioValue}>

            <AudioVolumeContext.Provider value={audioVolumeValue}>
                <AudioVolumeDispatchContext.Provider value={audioVolumeDispatch}>

                    <AudioCurrentContext.Provider value={audioCurrentValue}>
                        <AudioCurrentDispatchContext.Provider value={audioCurrentDispatch}>

                            {children}

                        </AudioCurrentDispatchContext.Provider>
                    </AudioCurrentContext.Provider>

                </AudioVolumeDispatchContext.Provider>
            </AudioVolumeContext.Provider>

        </AudioContext.Provider>;
    };

    const useAudioContext = () => React.useContext(AudioContext);

    const useAudioVolumeContext = () => React.useContext(AudioVolumeContext);

    const useAudioVolumeDispatch = () => {
        const musicContext = useAudioContext();
        const dispatch = React.useContext(AudioVolumeDispatchContext);

        return (volume: number) => {

            if (musicContext) {
                applyAudioVolume(musicContext, volume);
            }

            localStorage.setItem(storageAudioVolumeKey, volume + '');

            dispatch(volume);
        };
    };

    const useAudioCurrentContext = () => React.useContext(AudioCurrentContext);

    const useAudioCurrentDispatch = () => React.useContext(AudioCurrentDispatchContext);

    const getNextAudio = (
        audioContext: AudioContextValue,
        currentAudio: AudioCurrent | null,
        audioKey: K,
        assets: A
    ) => {

        const prevIndex = currentAudio?.history[ audioKey ] ?? -1;
        const nextIndex = (prevIndex + 1) % assets[ audioKey ].length;

        const nextAudio = audioContext[ audioKey ][ nextIndex ];

        return {
            prevIndex,
            nextIndex,
            nextAudio
        };
    };

    return {
        AudioContextProvider,
        contextList,
        useAudioContext,
        useAudioVolumeContext,
        useAudioVolumeDispatch,
        useAudioCurrentContext,
        useAudioCurrentDispatch,
        getNextAudio
    };
};
