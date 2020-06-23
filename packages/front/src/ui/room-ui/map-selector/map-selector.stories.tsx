import { MapConfig } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
import { battleReducer } from '../../reducers/battle-reducers/battle-reducer';
import { MapSelector } from './map-selector';

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

export const Default: React.FC = () => {

    const mapList: MapConfig[] = getMapList();

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'p1'
        },
        step: 'room',
        battle: battleReducer(undefined, { type: '' }),
        room: {
            roomId: '',
            teamsTree: {
                playerList: [ {
                    id: 'p1',
                    isAdmin: true,
                    isLoading: false,
                    isReady: false,
                    name: 'p1',
                    characters: []
                } ],
                teamList: []
            },
            map: {
                mapList,
                mapSelected: null
            },
            launchTime: null
        }
    };

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
        middlewareList: []
    });

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { },
        gameUIChildren: <MapSelector defaultOpen={true} />
    });

    return view;
};
