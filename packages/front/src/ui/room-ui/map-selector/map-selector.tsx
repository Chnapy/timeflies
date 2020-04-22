import { MapConfig } from '@timeflies/shared';
import React from 'react';
import { MapSelectorItem } from './map-selector-item';

export interface MyMapConfig extends MapConfig {
    name: string;
    width: number;
    height: number;
    nbrTeams: number;
    nbrCharactersPerTeam: number;
}

export interface MapSelectorProps {
    mapList: MyMapConfig[];
}

export const MapSelector: React.FC<MapSelectorProps> = ({ mapList }) => {

    return <div>
        {mapList.map(config => <MapSelectorItem key={config.id} id={config.id} />)}
    </div>;
};
