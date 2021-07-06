import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { useMusicContext, useMusicCurrentContext, useMusicCurrentDispatch } from '../view/music-context';


export const useMusic = () => {
    const musicContext = useMusicContext();
    const currentMusic = useMusicCurrentContext();
    const dispatchCurrentMusic = useMusicCurrentDispatch();

    const fnRef = React.useRef<(musicKey: Assets.MusicKey) => void>();
    fnRef.current = (musicKey: Assets.MusicKey) => {
        if (!musicContext || musicKey === currentMusic?.musicKey) {
            return;
        }

        const prevMusic = currentMusic && musicContext[ currentMusic.musicKey ][ currentMusic.index ];
        console.log('M', musicKey, currentMusic?.musicKey, currentMusic?.index, prevMusic)

        const prevIndex = currentMusic?.history[ musicKey ] ?? -1;
        const nextIndex = (prevIndex + 1) % Assets.musics[ musicKey ].length;

        const nextMusic = musicContext[ musicKey ][ nextIndex ];

        if (prevMusic) {
            prevMusic.fade(1, 0, 1000);
            prevMusic.once('fade', () => {
                prevMusic.pause();
            });
        }

        nextMusic.volume(1);
        nextMusic.play();
        nextMusic.fade(0, 1, 1000);

        dispatchCurrentMusic({ musicKey, index: nextIndex });
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
