import { makeStyles, Slider, Table, TableCell, TableRow } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { useMusicContext, useMusicVolumeContext, useMusicVolumeDispatch } from './music-context';

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
    const hasMusicContext = !!useMusicContext();
    const musicVolume = useMusicVolumeContext();
    const setMusicVolume = useMusicVolumeDispatch();

    return <>
        <UIText variant='h4'>Audio</UIText>

        <Table>
            <TableRow>
                <TableCell className={classes.labelCell} size='small'>
                    <UIText variant='body1'>Music</UIText>
                </TableCell>

                <TableCell className={classes.sliderCell}>
                    {hasMusicContext
                        ? <Slider
                            className={classes.slider}
                            min={0}
                            max={1}
                            step={0.1}
                            value={musicVolume}
                            onChange={(e, value) => {
                                if (value === musicVolume) {
                                    return;
                                }

                                setMusicVolume(value as number);
                            }}
                        />
                        : <UIText variant='body2'>click anywhere to enable</UIText>}
                </TableCell>
            </TableRow>
        </Table>

    </>;
};
