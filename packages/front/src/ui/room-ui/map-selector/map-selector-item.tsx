import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { MyMapConfig } from './map-selector';

export interface MapSelectorItemProps {
    map: MyMapConfig;
    isSelected: boolean;
    onSelect: () => void;
}

const useStyles = makeStyles(({ spacing }) => ({
    root: ({ isSelected }: { isSelected: boolean }) => ({
        display: 'inline-block',
    }),
    actionArea: {
        display: 'flex',
        alignItems: 'stretch'
    },
    media: {
        width: 180,
        flexShrink: 0
    }
}));

export const MapSelectorItem: React.FC<MapSelectorItemProps> = ({ map, isSelected, onSelect }) => {
    const { name, previewUrl, width, height, nbrTeams, nbrCharactersPerTeam } = map;

    const classes = useStyles({ isSelected });

    return (
        <Card className={classes.root}>
            <CardActionArea className={classes.actionArea} onClick={onSelect}>

                <CardContent>

                    <Typography variant='h6'>{name}</Typography>
                    <Typography variant='subtitle1'>{width}x{height}</Typography>

                    <Typography variant='body1'>
                        Teams: {nbrTeams}
                        <br />
                        Characters: {nbrCharactersPerTeam * nbrTeams} ({nbrCharactersPerTeam}/team)
                    </Typography>

                </CardContent>

                <CardMedia className={classes.media} image={previewUrl}>
                    <Skeleton variant='rect' height='100%' animation={false} />
                </CardMedia>
            </CardActionArea>
        </Card>
    );
};
