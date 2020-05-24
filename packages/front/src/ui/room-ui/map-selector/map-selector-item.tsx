import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Skeleton } from '@material-ui/lab';
import { MapConfig } from '@timeflies/shared';
import React from 'react';
import { UIText } from '../../battle-ui/spell-panel/spell-button/ui-text';

export interface MapSelectorItemProps {
    map: MapConfig;
    isSelected: boolean;
    onSelect: () => void;
    isDisabled?: boolean;
}

const useStyles = makeStyles(() => ({
    root: () => ({
        display: 'inline-block',
        borderWidth: 2,
        borderStyle: 'solid'
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

export const MapSelectorItem: React.FC<MapSelectorItemProps> = ({ map, isSelected, onSelect, isDisabled }) => {
    const { name, previewUrl, width, height, nbrTeams, nbrCharactersPerTeam } = map;

    const classes = useStyles();

    return (
        <Card className={classes.root} elevation={0}>
            <CardActionArea className={classes.actionArea} disabled={isDisabled} onClick={onSelect}>

                <CardContent>

                    <UIText variant='main'>{name}</UIText>
                    <UIText variant='second'>{width}x{height}</UIText>
                    <UIText variant='second'>Teams: {nbrTeams}</UIText>
                    <UIText variant='second'>Characters: {nbrCharactersPerTeam * nbrTeams} ({nbrCharactersPerTeam}/team)</UIText>

                </CardContent>

                <CardMedia className={classes.media} image={previewUrl}>
                    <Skeleton variant='rect' height='100%' animation={false} />
                </CardMedia>
            </CardActionArea>
        </Card>
    );
};
