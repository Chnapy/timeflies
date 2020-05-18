import { MapConfig } from '@timeflies/shared';
import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { GameState } from '../../../game-state';
import { MapSelector } from './map-selector';
import { AssetManager } from '../../../assetManager/AssetManager';

export default {
    title: 'Room/Map Selector',
    component: MapSelector
};

const getMapList = (): MapConfig[] => [
    {
        id: '1',
        name: 'Map 1',
        previewUrl: AssetManager.fake.mapPreview,
        width: 10,
        height: 8,
        nbrTeams: 2,
        nbrCharactersPerTeam: 3,
        schemaUrl: AssetManager.fake.mapSchema,
    },
    {
        id: '2',
        name: 'Map 2',
        previewUrl: AssetManager.fake.mapPreview,
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: AssetManager.fake.mapSchema,
    },
    {
        id: '3',
        name: 'Map 3',
        previewUrl: AssetManager.fake.mapPreview,
        width: 22,
        height: 23,
        nbrTeams: 3,
        nbrCharactersPerTeam: 2,
        schemaUrl: AssetManager.fake.mapSchema,
    },
];

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const mapList: MapConfig[] = getMapList();

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'p1'
        },
        step: 'room',
        battle: null,
        room: {
            roomId: '',
            teamsTree: {
                playerList: [{
                    id: 'p1',
                    isAdmin: true,
                    isLoading: false,
                    isReady: false,
                    name: 'p1',
                    characters: []
                }],
                teamList: []
            },
            map: {
                mapList,
                mapSelected: null
            },
            launchTime: null
        }
    };

    const { Provider } = fakeBattleApi.init({ initialState });

    return <Provider>
        <MapSelector defaultOpen={true} />
    </Provider>;
};
