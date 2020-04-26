import React from 'react';
import { EntityTreeData } from '../../reducers/room-reducers/entity-tree-reducer';
import { EntityTree } from './entity-tree';
import { GameState } from '../../../game-state';
import { createStore } from 'redux';
import { RootReducer } from '../../reducers/root-reducer';
import { Provider } from 'react-redux';

export default {
    title: 'Room/Entity Tree',
    component: EntityTree
};

export const Default = () => {

    const entityTreeData: EntityTreeData = {
        teams: [
            {
                id: 't1',
                letter: 'A',
                players: [
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
                    }
                ]
            },
            {
                id: 't2',
                letter: 'B',
                players: [
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
                ]
            }
        ]
    };

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy',
        },
        step: 'room',
        battle: null,
        load: null,
        room: {
            map: {
                mapList: [],
                mapListLoading: false,
                mapSelected: null
            },
            teamsTree: entityTreeData
        }
    };

    const store = createStore(
        RootReducer,
        initialState
    );

    return <Provider store={store}>
        <EntityTree />
    </Provider>;
};
