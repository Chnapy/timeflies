import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { createView } from '../../../view';
import { battleReducer } from '../../reducers/battle-reducers/battle-reducer';
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
                        type: 'sampleChar1',
                        position: {
                            x: 4, y: 8
                        }
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
                        type: 'sampleChar1',
                        position: {
                            x: 0, y: 2
                        }
                    },
                    {
                        id: 'c3',
                        type: 'sampleChar2',
                        position: {
                            x: 10, y: 8
                        }
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
                        type: 'sampleChar2',
                        position: {
                            x: 6, y: 2
                        }
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

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy',
        },
        step: 'room',
        battle: battleReducer(undefined, {type: ''}),
        room: {
            roomId: '',
            map: {
                mapList: [],
                mapSelected: null
            },
            teamsTree: entityTreeData,
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
        gameUIChildren: <EntityTree />
    });

    return view;
};
