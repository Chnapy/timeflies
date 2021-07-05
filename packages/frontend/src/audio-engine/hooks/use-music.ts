import { Assets } from '@timeflies/static-assets';
import { Howler } from 'howler';
import React from 'react';
import { useMusicContext } from '../view/music-context';


export const useMusic = () => {
    const musicContext = useMusicContext();
    const [ currentMusic, setCurrentMusic ] = React.useState<Assets.MusicKey | null>(null);

    return React.useCallback((musicKey: Assets.MusicKey) => {

        if (!musicContext || musicKey === currentMusic) {
            return;
        }

        Howler.stop();

        musicContext[ musicKey ].play();
        musicContext[ musicKey ].fade(0, 1, 500);

        setCurrentMusic(musicKey);
    }, [ musicContext, currentMusic ]);
};

export const usePlayMusic = (musicKey: Assets.MusicKey) => {
    const playMusic = useMusic();

    React.useEffect(() => {
        playMusic(musicKey);

    }, [ playMusic, musicKey ]);
};
