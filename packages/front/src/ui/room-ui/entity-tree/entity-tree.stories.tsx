import { Box } from '@material-ui/core';
import { createPosition } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { seedGameState } from '../../../game-state.seed';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
import { EntityTreeData } from '../../reducers/room-reducers/entity-tree-reducer/entity-tree-reducer';
import { EntityTree } from './entity-tree';

export default {
    title: 'Room/Entity Tree',
    component: EntityTree
};

export const Default: React.FC = () => {

    const entityTreeData: EntityTreeData = {
        playerList: [
            {
                id: 'p1',
                name: 'chnapy',
                isAdmin: true,
                isLoading: false,
                isReady: true,
                characters: [
                    {
                        id: 'c1',
                        type: 'tacka',
                        position: createPosition(4, 8)
                    }
                ]
            },
            {
                id: 'p2',
                name: 'pychnap',
                isAdmin: false,
                isLoading: true,
                isReady: false,
                characters: [
                    {
                        id: 'c2',
                        type: 'tacka',
                        position: createPosition(0, 2)
                    },
                    {
                        id: 'c3',
                        type: 'vemo',
                        position: createPosition(10, 8)
                    }
                ]
            },
            {
                id: 'p3',
                name: 'yoshi2oeuf',
                isAdmin: false,
                isLoading: true,
                isReady: true,
                characters: [
                    {
                        id: 'c4',
                        type: 'meti',
                        position: createPosition(6, 2)
                    }
                ]
            }
        ],
        teamList: [
            {
                id: 't1',
                letter: 'A',
                playersIds: [ 'p1', 'p2' ]
            },
            {
                id: 't2',
                letter: 'B',
                playersIds: [ 'p3' ]
            }
        ]
    };

    const initialState = seedGameState('p1', {
        step: 'room',
        room: {
            roomId: '',
            map: {
                mapList: [],
                mapSelected: null
            },
            teamsTree: entityTreeData,
            launchTime: null
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
        gameUIChildren: <Box width={300}>
            <EntityTree />
        </Box>
    });

    return view;
};
