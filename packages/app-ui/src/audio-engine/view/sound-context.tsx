import { Assets } from '@timeflies/static-assets';
import { createAudioContext } from '../utils/create-audio-context';

const {
    AudioContextProvider: SoundContextProvider,
    useAudioContext: useSoundContext,
    useAudioVolumeContext: useSoundVolumeContext,
    useAudioVolumeDispatch: useSoundVolumeDispatch,
    useAudioCurrentContext: useSoundCurrentContext,
    useAudioCurrentDispatch: useSoundCurrentDispatch,
    getNextAudio: getNextSound
} = createAudioContext({
    contextsNamePrefix: 'Sound',
    storageAudioVolumeKeyPrefix: 'sound',
    defaultAudioVolume: 0.75,
    assets: Assets.sounds
});

export {
    SoundContextProvider,
    useSoundContext,
    useSoundVolumeContext,
    useSoundVolumeDispatch,
    useSoundCurrentContext,
    useSoundCurrentDispatch,
    getNextSound
};
