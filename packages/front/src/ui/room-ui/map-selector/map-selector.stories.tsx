import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { GameState } from '../../../game-state';
import map1Url from '../../../_assets/map/map.json';
import { MapSelector, MyMapConfig } from './map-selector';

export default {
    title: 'Room/Map Selector',
    component: MapSelector
};

const getMapList = (): MyMapConfig[] => [
    {
        id: '1',
        name: 'Map 1',
        previewUrl: 'placeholder',
        width: 10,
        height: 8,
        nbrTeams: 2,
        nbrCharactersPerTeam: 3,
        schemaUrl: map1Url,
        defaultTilelayerName: 'decor',
        obstacleTilelayerName: 'obstacles',
        initLayerName: 'init'
    },
    {
        id: '2',
        name: 'Map 2',
        previewUrl: 'placeholder',
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: map1Url,
        defaultTilelayerName: 'decor',
        obstacleTilelayerName: 'obstacles',
        initLayerName: 'init'
    },
    {
        id: '3',
        name: 'Map 3',
        previewUrl: 'placeholder',
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: map1Url,
        defaultTilelayerName: 'decor',
        obstacleTilelayerName: 'obstacles',
        initLayerName: 'init'
    },
];

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const mapList: MyMapConfig[] = getMapList();

    const initialState: GameState = {
        currentPlayer: null,
        step: 'room',
        battle: null,
        load: null,
        room: {
            teamsTree: {
                teams: []
            },
            map: {
                mapList,
                mapSelected: null
            }
        }
    };

    fakeBattleApi.init({ initialState });

    return (
        <MapSelector defaultOpen={true} />
    );
};
