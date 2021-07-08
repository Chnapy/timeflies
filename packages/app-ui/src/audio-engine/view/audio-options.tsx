import { makeStyles, Slider, Table, TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import { UIText } from '../../components/ui-text/ui-text';
import { useSound } from '../hooks/use-sound';
import { useMusicContext, useMusicVolumeContext, useMusicVolumeDispatch } from './music-context';
import { useSoundContext, useSoundVolumeContext, useSoundVolumeDispatch } from './sound-context';

const useStyles = makeStyles(({ spacing }) => ({
    labelCell: {
        paddingLeft: 0,
        paddingRight: spacing(1),
        border: 'none'
    },
    sliderCell: {
        width: '100%',
        border: 'none'
    },
    slider: {
        verticalAlign: 'text-top'
    }
}));

export const AudioOptions: React.FC = () => {
    const classes = useStyles();
    const playSound = useSound();

    const hasMusicContext = !!useMusicContext();
    const musicVolume = useMusicVolumeContext();
    const setMusicVolume = useMusicVolumeDispatch();

    const hasSoundContext = !!useSoundContext();
    const soundVolume = useSoundVolumeContext();
    const setSoundVolume = useSoundVolumeDispatch();

    const volumeLines = [
        {
            name: 'Music',
            hasContext: hasMusicContext,
            volume: musicVolume,
            setVolume: setMusicVolume
        },
        {
            name: 'Sounds',
            hasContext: hasSoundContext,
            volume: soundVolume,
            setVolume: setSoundVolume
        },
    ];

    const previousSoundVolume = React.useRef<number>();
    React.useEffect(() => {
        if (previousSoundVolume.current !== soundVolume) {
            playSound('buttonClick');
        }

        previousSoundVolume.current = soundVolume;
    }, [ soundVolume, playSound ]);

    return <>
        <UIText variant='h4'>Audio</UIText>

        <Table>
            {volumeLines.map(({ name, hasContext, volume, setVolume }) => (
                <TableRow key={name}>
                    <TableCell className={classes.labelCell} size='small'>
                        <UIText variant='body1'>{name}</UIText>
                    </TableCell>

                    <TableCell className={classes.sliderCell}>
                        {hasContext
                            ? <Slider
                                className={classes.slider}
                                min={0}
                                max={1}
                                step={0.1}
                                value={volume}
                                onChange={(e, value) => {
                                    if (value === volume) {
                                        return;
                                    }

                                    setVolume(value as number);
                                }}
                            />
                            : <UIText variant='body2'>click anywhere to enable</UIText>}
                    </TableCell>
                </TableRow>
            ))}
        </Table>

    </>;
};
