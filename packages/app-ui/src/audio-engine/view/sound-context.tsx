import { Assets } from '@timeflies/static-assets';
import { createAudioContext } from '../utils/create-audio-context';

const {
    AudioContextProvider: SoundContextProvider,
    contextList: soundContextList,
    useAudioContext: useSoundContext,
    useAudioVolumeContext: useSoundVolumeContext,
    useAudioVolumeDispatch: useSoundVolumeDispatch,
    useAudioCurrentContext: useSoundCurrentContext,
    useAudioCurrentDispatch: useSoundCurrentDispatch,
    getNextAudio: getNextSound
} = createAudioContext({
    contextsNamePrefix: 'Sound',
    storageAudioVolumeKeyPrefix: 'sound',
    defaultAudioVolume: 0.4,
    assets: Assets.sounds
});

export {
    SoundContextProvider,
    soundContextList,
    useSoundContext,
    useSoundVolumeContext,
    useSoundVolumeDispatch,
    useSoundCurrentContext,
    useSoundCurrentDispatch,
    getNextSound
};
