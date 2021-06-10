import { Grid, makeStyles } from '@material-ui/core';
import { UIButton, UIButtonProps, UIText } from '@timeflies/app-ui';
import { MapInfos } from '@timeflies/socket-messages';
import React from 'react';
import { RoomMapButtonImage } from './room-map-button-image';

type RoomMapButtonProps = Pick<UIButtonProps, 'disabled' | 'onClick'> & {
    mapInfos: MapInfos;
};

const width = 200;
const height = 100;

const useStyles = makeStyles(({spacing}) => ({
    root: {
        position: 'relative',
        width,
        height
    },
    content: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexWrap: 'nowrap'
    },
    description: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: spacing(0.5),
        flexWrap: 'nowrap'
    }
}));

export const RoomMapButton: React.FC<RoomMapButtonProps> = ({ mapInfos, ...rest }) => {
    const classes = useStyles();

    return (
        <UIButton className={classes.root} {...rest}>
            <Grid className={classes.content} container>

                <Grid item>
                    <RoomMapButtonImage mapInfos={mapInfos} width={width / 2} height={height} />
                </Grid>

                <Grid className={classes.description} item>
                    <UIText variant='body1'>
                        {mapInfos.name}
                    </UIText>

                    <UIText variant='body2'>
                        Max teams: {mapInfos.nbrTeams}<br />
                    Max characters: {mapInfos.nbrTeams * mapInfos.nbrTeamCharacters}
                    </UIText>
                </Grid>

            </Grid>
        </UIButton>
    );
};
