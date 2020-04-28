import { MapConfig } from '@timeflies/shared';
import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { GameState } from '../../../game-state';
import map1Url from '../../../_assets/map/map.json';
import { MapSelector } from './map-selector';
import mapPreviewUrl from '../../../_assets/map/map_preview.png';

export default {
    title: 'Room/Map Selector',
    component: MapSelector
};

const getMapList = (): MapConfig[] => [
    {
        id: '1',
        name: 'Map 1',
        previewUrl: mapPreviewUrl,
        width: 10,
        height: 8,
        nbrTeams: 2,
        nbrCharactersPerTeam: 3,
        schemaUrl: map1Url,
    },
    {
        id: '2',
        name: 'Map 2',
        previewUrl: mapPreviewUrl,
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: map1Url,
    },
    {
        id: '3',
        name: 'Map 3',
        previewUrl: mapPreviewUrl,
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: map1Url,
    },
];

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const mapList: MapConfig[] = getMapList();

    const initialState: GameState = {
        currentPlayer: null,
        step: 'room',
        battle: null,
        load: null,
        room: {
            teamsTree: {
                playerList: [],
                teamList: []
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
