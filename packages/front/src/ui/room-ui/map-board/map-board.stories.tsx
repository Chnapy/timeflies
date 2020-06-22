import { Box } from '@material-ui/core';
import { MapConfig, createPosition } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { createView } from '../../../view';
import { battleReducer } from '../../reducers/battle-reducers/battle-reducer';
import { MapBoard } from './map-board';
import { MapBoardTile, MapBoardTileInfos } from './map-board-tile/map-board-tile';

export default {
    title: 'Room/Map Board',
    component: MapBoard
};

export const BoardTile: React.FC = () => {

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy'
        },
        step: 'room',
        battle: battleReducer(undefined, { type: '' }),
        room: {
            roomId: '',
            teamsTree: {
                playerList: [
                    {
                        id: 'p1',
                        isAdmin: true,
                        isLoading: true,
                        isReady: true,
                        name: 'p-1',
                        characters: [
                            {
                                id: 'c1',
                                position: createPosition(2, 0),
                                type: 'sampleChar1'
                            }
                        ]
                    },
                    {
                        id: 'p2',
                        isAdmin: false,
                        isLoading: true,
                        isReady: false,
                        name: 'p-2',
                        characters: [ {
                            id: 'c2',
                            type: 'sampleChar2',
                            position: createPosition(4, 0)
                        } ]
                    }
                ],
                teamList: [
                    {
                        id: 't1',
                        letter: 'A',
                        playersIds: [ 'p1' ]
                    },
                    {
                        id: 't2',
                        letter: 'B',
                        playersIds: [ 'p2' ]
                    }
                ]
            },
            map: {
                mapList: [],
                mapSelected: null
            },
            launchTime: null
        }
    };

    const tileInfosList: MapBoardTileInfos[] = [
        {
            type: 'obstacle',
            position: createPosition(0, 0)
        },
        {
            type: 'placement',
            position: createPosition(1, 0),
            teamId: 't1',
        },
        {
            type: 'placement',
            position: createPosition(2, 0),
            teamId: 't1',
        },
        {
            type: 'placement',
            position: createPosition(3, 0),
            teamId: 't2',
        },
        {
            type: 'placement',
            position: createPosition(4, 0),
            teamId: 't2',
        }
    ];

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
        gameUIChildren: <>
            {tileInfosList.map((tileInfos, i) =>
                <Box key={i} m={2}>
                    <MapBoardTile tileInfos={tileInfos} />
                </Box>
            )}
        </>
    });

    return view;
};

export const Board: React.FC = () => {

    const map: MapConfig = {
        id: '1',
        name: 'Map 1',
        previewUrl: 'placeholder',
        width: 10,
        height: 8,
        nbrTeams: 2,
        nbrCharactersPerTeam: 3,
        schemaUrl: '',
    };

    const tileList: MapBoardTileInfos[] = [];

    const placementPos: MapBoardTileInfos<'placement'>[] = [
        {
            type: 'placement',
            teamId: 't1',
            position: createPosition(3, 2)
        },
        {
            type: 'placement',
            teamId: 't1',
            position: createPosition(5, 2)
        },
        {
            type: 'placement',
            teamId: 't1',
            position: createPosition(7, 2)
        },
        {
            type: 'placement',
            teamId: 't2',
            position: createPosition(3, 5)
        },
        {
            type: 'placement',
            teamId: 't2',
            position: createPosition(5, 5)
        },
        {
            type: 'placement',
            teamId: 't2',
            position: createPosition(7, 5)
        },
    ];

    const pi = Math.PI + '';
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {

            const p = createPosition(x, y);

            const placement = placementPos.find(ip => ip.position.id === p.id);

            if (placement) {
                tileList.push(placement);
            } else {

                const mod = +pi[ (y * map.width + x) % pi.length ] % 4 === 0;

                if (mod) {
                    tileList.push({
                        position: p,
                        type: 'obstacle'
                    });
                }
            }
        }
    }


    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy'
        },
        step: 'room',
        battle: battleReducer(undefined, { type: '' }),
        room: {
            roomId: '',
            teamsTree: {
                playerList: [
                    {
                        id: 'p1',
                        isAdmin: true,
                        isLoading: true,
                        isReady: true,
                        name: 'p-1',
                        characters: [
                            {
                                id: 'c1',
                                position: createPosition(5, 2),
                                type: 'sampleChar1'
                            }
                        ]
                    },
                    {
                        id: 'p2',
                        isAdmin: false,
                        isLoading: true,
                        isReady: false,
                        name: 'p-2',
                        characters: [ {
                            id: 'c2',
                            type: 'sampleChar2',
                            position: createPosition(3, 5)
                        } ]
                    }
                ],
                teamList: [
                    {
                        id: 't1',
                        letter: 'A',
                        playersIds: [ 'p1' ]
                    },
                    {
                        id: 't2',
                        letter: 'B',
                        playersIds: [ 'p2' ]
                    }
                ]
            },
            map: {
                mapList: [ map ],
                mapSelected: {
                    id: map.id,
                    tileListLoading: false,
                    tileList
                }
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
        gameUIChildren: <MapBoard />
    });

    return view;
};
