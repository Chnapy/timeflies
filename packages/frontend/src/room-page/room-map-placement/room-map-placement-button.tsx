import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import React from 'react';
import { RoomMapPlacement } from './room-map-placement';

type RoomMapPlacementButtonProps = Pick<UIButtonProps, 'startIcon'>;

export const RoomMapPlacementButton: React.FC<RoomMapPlacementButtonProps> = ({ startIcon }) => {
    const [ placementOpen, setPlacementOpen ] = React.useState(false);

    const onPlacementClose = () => setPlacementOpen(false);
    const onPlacementOpen = () => setPlacementOpen(true);

    return <>
        <UIButton startIcon={startIcon} onClick={onPlacementOpen}>
            place characters
        </UIButton>

        <RoomMapPlacement open={placementOpen} onClose={onPlacementClose}/>
    </>;
};
