import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { getNextMusic, useMusicContext, useMusicCurrentContext, useMusicCurrentDispatch, useMusicVolumeContext } from '../view/music-context';


export const useMusic = () => {
    const musicContext = useMusicContext();
    const currentMusic = useMusicCurrentContext();
    const dispatchCurrentMusic = useMusicCurrentDispatch();
    const musicVolume = useMusicVolumeContext();

    const fnRef = React.useRef<(musicKey: Assets.MusicKey) => void>();
    fnRef.current = musicKey => {
        if (!musicContext || musicKey === currentMusic?.currentKey) {
            return;
        }

        const prevMusic = currentMusic && musicContext[ currentMusic.currentKey ][ currentMusic.index ];

        const {
            nextIndex,
            nextAudio: nextMusic
        } = getNextMusic(musicContext, currentMusic, musicKey, Assets.musics);

        if (prevMusic) {
            prevMusic.fade(musicVolume, 0, 1000);
            prevMusic.once('fade', () => {
                prevMusic.pause();
            });
        }

        nextMusic.volume(musicVolume);
        nextMusic.play();
        nextMusic.fade(0, musicVolume, 1000);

        dispatchCurrentMusic({ currentKey: musicKey, index: nextIndex });
    };

    // avoid unecessary music playing (causing infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback((musicKey: Assets.MusicKey) => fnRef.current!(musicKey), [ fnRef, musicContext ]);
};

export const usePlayMusic = (musicKey: Assets.MusicKey) => {
    const playMusic = useMusic();

    React.useEffect(() => {
        playMusic(musicKey);

    }, [ playMusic, musicKey ]);
};
