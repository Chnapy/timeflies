import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { useMusicContext, useMusicCurrentContext, useMusicCurrentDispatch } from '../view/music-context';


export const useMusic = () => {
    const musicContext = useMusicContext();
    const currentMusic = useMusicCurrentContext();
    const dispatchCurrentMusic = useMusicCurrentDispatch();

    return React.useCallback((musicKey: Assets.MusicKey) => {

        if (!musicContext || musicKey === currentMusic) {
            return;
        }

        const prevMusic = currentMusic && musicContext[ currentMusic ];
        const nextMusic = musicContext[ musicKey ];

        if (prevMusic) {
            prevMusic.fade(1, 0, 1000);
            prevMusic.once('fade', () => {
                prevMusic.pause();
            });
        }

        nextMusic.volume(1);
        nextMusic.play();
        nextMusic.fade(0, 1, 1000);

        dispatchCurrentMusic(musicKey);
    }, [ musicContext, currentMusic, dispatchCurrentMusic ]);
};

export const usePlayMusic = (musicKey: Assets.MusicKey) => {
    const playMusic = useMusic();

    React.useEffect(() => {
        playMusic(musicKey);

    }, [ playMusic, musicKey ]);
};
