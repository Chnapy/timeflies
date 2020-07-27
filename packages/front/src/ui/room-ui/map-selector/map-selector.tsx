import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import { assertIsDefined, MapConfig } from '@timeflies/shared';
import React from 'react';
import { useGameNetwork } from '../../hooks/useGameNetwork';
import { useGameStep } from '../../hooks/useGameStep';
import { UIButton } from '../../ui-components/button/ui-button';
import { UITypography } from '../../ui-components/typography/ui-typography';
import { useCurrentPlayerRoom } from '../hooks/useCurrentPlayerRoom';
import { MapSelectorItem } from './map-selector-item';

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
            <UIButton onClick={onClick} disabled={disabled}>Choose a map</UIButton>
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
        <Box>
            <Card>
                <CardContent>
                    <UITypography variant='h3' align='center' gutterBottom>Map select</UITypography>
                    <Box display='flex' justifyContent='center'>
                        <RenderSingleChild
                            map={map}
                            onClick={() => {
                                sendMapList();
                                setOpen(true);
                            }}
                            disabled={!isAdmin}
                        />
                    </Box>
                </CardContent>
            </Card>
            <Dialog open={open} fullScreen>
                <CardContent>

                    <UITypography variant='h3' gutterBottom>Select a map</UITypography>

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

                </CardContent>
            </Dialog>
        </Box>
    );
};
