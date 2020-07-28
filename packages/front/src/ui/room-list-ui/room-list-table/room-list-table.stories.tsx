import { Container } from '@material-ui/core';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { seedGameState } from '../../../game-state.seed';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
import { RoomListTable } from './room-list-table';

export default {
    title: 'Room list/Table',
    component: RoomListTable
};

export const Default: React.FC = () => {

    const initialState = seedGameState('p1', {
        step: 'room',
        roomList: {
            list: {
                '1': {
                    id: '1',
                    adminName: 'chnapy',
                    mapName: 'Dungeon',
                    nbrPlayersMax: 6,
                    nbrPlayersCurrent: 2,
                    roomState: 'open'
                },
                '2': {
                    id: '2',
                    adminName: 'yoshi2oeuf',
                    nbrPlayersCurrent: 1,
                    roomState: 'no-map'
                },
                '3': {
                    id: '3',
                    adminName: 'chnapy',
                    mapName: 'Dungeon',
                    nbrPlayersMax: 6,
                    nbrPlayersCurrent: 6,
                    roomState: 'players-full'
                },
                '4': {
                    id: '4',
                    adminName: 'yoshi2oeuf',
                    mapName: 'Dungeon',
                    nbrPlayersMax: 6,
                    nbrPlayersCurrent: 5,
                    roomState: 'in-battle'
                },
            },
            ids: [
                '1', '2', '3', '4'
            ]
        }
    });

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
        gameUIChildren: <Container maxWidth='md' style={{ height: '100%', display: 'flex' }}>
            <RoomListTable />
        </Container>
    });

    return view;
};
