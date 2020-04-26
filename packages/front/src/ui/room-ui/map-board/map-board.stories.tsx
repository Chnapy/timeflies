import { equals } from '@timeflies/shared';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { GameState } from '../../../game-state';
import { RootReducer } from '../../reducers/root-reducer';
import { MyMapConfig } from '../map-selector/map-selector';
import { MapBoard } from './map-board';
import { MapBoardTile, MapBoardTileInfos } from './map-board-tile/map-board-tile';
import { Box } from '@material-ui/core';

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
        battle: null,
        load: null,
        room: {
            teamsTree: {
                teams: [
                    {
                        id: 't1',
                        letter: 'A',
                        players: [
                            {
                                id: 'p1',
                                isAdmin: true,
                                isLoading: true,
                                isReady: true,
                                name: 'p-1',
                                characters: [
                                    {
                                        id: 'c1',
                                        position: { x: 2, y: 0 },
                                        type: 'sampleChar1'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 't2',
                        letter: 'B',
                        players: [ {
                            id: 'p2',
                            isAdmin: false,
                            isLoading: true,
                            isReady: false,
                            name: 'p-2',
                            characters: [ {
                                id: 'c2',
                                type: 'sampleChar2',
                                position: { x: 4, y: 0 }
                            } ]
                        } ]
                    }
                ]
            },
            map: {
                mapListLoading: false,
                mapList: [],
                mapSelected: null
            }
        }
    };

    const store = createStore(
        RootReducer,
        initialState
    );

    const tileInfosList: MapBoardTileInfos[] = [
        {
            type: 'obstacle',
            position: { x: 0, y: 0 }
        },
        {
            type: 'placement',
            position: { x: 1, y: 0 },
            teamId: 't1',
        },
        {
            type: 'placement',
            position: { x: 2, y: 0 },
            teamId: 't1',
        },
        {
            type: 'placement',
            position: { x: 3, y: 0 },
            teamId: 't2',
        },
        {
            type: 'placement',
            position: { x: 4, y: 0 },
            teamId: 't2',
        }
    ];

    return <Provider store={store}>
        {tileInfosList.map((tileInfos, i) =>
            <Box key={i} m={2}>
                <MapBoardTile tileInfos={tileInfos} />
            </Box>
        )}
    </Provider>;
};

export const Board: React.FC = () => {

    const map: MyMapConfig = {
        id: '1',
        name: 'Map 1',
        previewUrl: 'placeholder',
        width: 10,
        height: 8,
        nbrTeams: 2,
        nbrCharactersPerTeam: 3,
        schemaUrl: '',
        defaultTilelayerName: 'decor',
        obstacleTilelayerName: 'obstacles',
        initLayerName: 'init'
    };

    const tileList: MapBoardTileInfos[] = [];

    const placementPos: MapBoardTileInfos<'placement'>[] = [
        {
            type: 'placement',
            teamId: 't1',
            position: { x: 3, y: 2 }
        },
        {
            type: 'placement',
            teamId: 't1',
            position: { x: 5, y: 2 }
        },
        {
            type: 'placement',
            teamId: 't1',
            position: { x: 7, y: 2 }
        },
        {
            type: 'placement',
            teamId: 't2',
            position: { x: 3, y: 5 }
        },
        {
            type: 'placement',
            teamId: 't2',
            position: { x: 5, y: 5 }
        },
        {
            type: 'placement',
            teamId: 't2',
            position: { x: 7, y: 5 }
        },
    ];

    const pi = Math.PI + '';
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {

            const placement = placementPos.find(ip => equals(ip.position)({ x, y }));

            if (placement) {
                tileList.push(placement);
            } else {

                const mod = +pi[ (y * map.width + x) % pi.length ] % 4 === 0;

                if (mod) {
                    tileList.push({
                        position: { x, y },
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
        battle: null,
        load: null,
        room: {
            teamsTree: {
                teams: [
                    {
                        id: 't1',
                        letter: 'A',
                        players: [
                            {
                                id: 'p1',
                                isAdmin: true,
                                isLoading: true,
                                isReady: true,
                                name: 'p-1',
                                characters: [
                                    {
                                        id: 'c1',
                                        position: { x: 5, y: 2 },
                                        type: 'sampleChar1'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 't2',
                        letter: 'B',
                        players: [ {
                            id: 'p2',
                            isAdmin: false,
                            isLoading: true,
                            isReady: false,
                            name: 'p-2',
                            characters: [ {
                                id: 'c2',
                                type: 'sampleChar2',
                                position: { x: 3, y: 5 }
                            } ]
                        } ]
                    }
                ]
            },
            map: {
                mapListLoading: false,
                mapList: [map],
                mapSelected: {
                    id: map.id,
                    tileList
                }
            }
        }
    };

    const store = createStore(
        RootReducer,
        initialState
    );

    return <Provider store={store}>
        <MapBoard />
    </Provider>;
};
