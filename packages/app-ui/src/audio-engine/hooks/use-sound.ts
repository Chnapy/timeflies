import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { getNextSound, useSoundContext, useSoundCurrentContext, useSoundCurrentDispatch } from '../view/sound-context';


export const useSound = () => {
    const soundContext = useSoundContext();
    const currentSound = useSoundCurrentContext();
    const dispatchCurrentSound = useSoundCurrentDispatch();

    const fnRef = React.useRef<(soundKey: Assets.SoundKey) => void>();
    fnRef.current = soundKey => {
        if (!soundContext) {
            return;
        }

        const {
            nextIndex,
            nextAudio: nextSound
        } = getNextSound(soundContext, currentSound, soundKey, Assets.sounds);

        nextSound.play();

        dispatchCurrentSound({ currentKey: soundKey, index: nextIndex });
    };

    // avoid unecessary sound playing (causing infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback((musicKey: Assets.SoundKey) => fnRef.current!(musicKey), [ fnRef, soundContext ]);
};
