import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { assertIsDefined, MapConfig } from '@timeflies/shared';
import React from 'react';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useGameStep } from '../../hooks/useGameStep';
import { MapSelectorItem } from './map-selector-item';

export interface MyMapConfig extends MapConfig {
    name: string;
    previewUrl: string;
    width: number;
    height: number;
    nbrTeams: number;
    nbrCharactersPerTeam: number;
}

export interface MapSelectorProps {
    defaultOpen?: boolean;
}

const RenderSingleChild: React.FC<{
    map: MyMapConfig | null;
    onClick: () => void;
}> = ({
    map, onClick
}) => {

        if (map) {
            return (
                <MapSelectorItem
                    map={map}
                    isSelected
                    onSelect={onClick}
                />
            );
        }

        return (
            <Card>
                <CardActionArea onClick={onClick}>
                    <CardContent>
                        Click to select a map
                </CardContent>
                </CardActionArea>
            </Card>
        );
    };

export const MapSelector: React.FC<MapSelectorProps> = ({ defaultOpen = false }) => {

    const [ open, setOpen ] = React.useState(defaultOpen);

    const network = useGameNetwork({
        sendMapSelect: (mapId: string) => ({
            type: 'room/map/select',
            mapId
        })
    });

    const { mapList, mapSelected } = useGameStep('room', room => room.map);

    const map = mapSelected
        ? mapList.find(m => m.id === mapSelected.id)
        : null;
    assertIsDefined(map);

    return (
        <Box display={'inline-flex'}>
            <Box display={'inline-flex'}>
                <RenderSingleChild
                    map={map}
                    onClick={() => {
                        setOpen(true);
                    }}
                />
            </Box>
            <Dialog open={open} fullScreen>

                <Typography variant={'h5'}>
                    Select a map
                </Typography>

                <Grid container spacing={2}>
                    {mapList.map(config => (
                        <Grid key={config.id} item>
                            <MapSelectorItem
                                map={config}
                                isSelected={config.id === mapSelected?.id}
                                onSelect={() => {
                                    setOpen(false);
                                    
                                    network.then(({ sendMapSelect }) => {
                                        sendMapSelect(config.id);
                                    });
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Dialog>
        </Box>
    );
};
