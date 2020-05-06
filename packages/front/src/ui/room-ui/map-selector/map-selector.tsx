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
import { useCurrentPlayerRoom } from '../hooks/useCurrentPlayerRoom';

export interface MapSelectorProps {
    defaultOpen?: boolean;
}

const RenderSingleChild: React.FC<{
    map: MapConfig | null;
    onClick: () => void;
    disabled: boolean;
}> = ({
    map, onClick, disabled
}) => {

        if (map) {
            return (
                <MapSelectorItem
                    map={map}
                    isSelected
                    isDisabled={disabled}
                    onSelect={onClick}
                />
            );
        }

        return (
            <Card>
                <CardActionArea onClick={onClick} disabled={disabled}>
                    <CardContent>
                        Click to select a map
                </CardContent>
                </CardActionArea>
            </Card>
        );
    };

export const MapSelector: React.FC<MapSelectorProps> = ({ defaultOpen = false }) => {

    const [ open, setOpen ] = React.useState(defaultOpen);

    const { sendMapList, sendMapSelect } = useGameNetwork({
        sendMapList: () => ({
            type: 'room/map/list'
        }),
        sendMapSelect: (mapId: string) => ({
            type: 'room/map/select',
            mapId
        })
    });

    const mapList = useGameStep('room', room => room.map.mapList);
    const mapSelectedId = useGameStep('room', room => room.map.mapSelected?.id);

    const isAdmin = useCurrentPlayerRoom(p => p.isAdmin);

    const map = mapSelectedId
        ? mapList.find(m => m.id === mapSelectedId)
        : null;
    assertIsDefined(map);

    return (
        <Box display={'inline-flex'}>
            <Box display={'inline-flex'}>
                <RenderSingleChild
                    map={map}
                    onClick={() => {
                        sendMapList();
                        setOpen(true);
                    }}
                    disabled={!isAdmin}
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
                                isSelected={config.id === mapSelectedId}
                                onSelect={() => {
                                    setOpen(false);

                                    sendMapSelect(config.id);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Dialog>
        </Box>
    );
};
