import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { createView } from '../../../view';
import { battleReducer } from '../../reducers/battle-reducers/battle-reducer';
import { EntityTreeData } from '../../reducers/room-reducers/entity-tree-reducer/entity-tree-reducer';
import { RoomData } from '../../reducers/room-reducers/room-reducer';
import { ReadyButton } from './ready-button';

export default {
    title: 'Room/Ready button',
    component: ReadyButton
};

const Wrapper: React.FC<{
    roomState: RoomData;
}> = ({ roomState }) => {

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy',
        },
        step: 'room',
        battle: battleReducer(undefined, {type: ''}),
        room: roomState
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
        createPixi: async () => {},
        gameUIChildren: <ReadyButton />
    });

    return view;
};

const getWaitingOthersState = (): RoomData => {

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
                    }
                ]
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
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: null
    };
};

const getShouldPutCharactersState = (): RoomData => {

    const entityTreeData: EntityTreeData = {
        playerList: [
            {
                id: 'p1',
                name: 'chnapy',
                isAdmin: true,
                isLoading: false,
                isReady: true,
                characters: []
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
                    }
                ]
            }
        ],
        teamList: [
            {
                id: 't1',
                letter: 'A',
                playersIds: []
            },
            {
                id: 't2',
                letter: 'B',
                playersIds: [ 'p2' ]
            }
        ]
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: null
    };
};

const getTeamsEnoughState = (): RoomData => {

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
                            x: 0, y: 1
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
                ]
            }
        ],
        teamList: [
            {
                id: 't1',
                letter: 'A',
                playersIds: []
            },
            {
                id: 't2',
                letter: 'B',
                playersIds: [ 'p1', 'p2' ]
            }
        ]
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: null
    };
};

const getNotReadyState = (): RoomData => {

    const entityTreeData: EntityTreeData = {
        playerList: [
            {
                id: 'p1',
                name: 'chnapy',
                isAdmin: true,
                isLoading: false,
                isReady: false,
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
                    }
                ]
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
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: null
    };
};

const getIsLoadingState = (): RoomData => {

    const entityTreeData: EntityTreeData = {
        playerList: [
            {
                id: 'p1',
                name: 'chnapy',
                isAdmin: true,
                isLoading: true,
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
                    }
                ]
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
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: null
    };
};

const getLaunchState = (): RoomData => {

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
                isLoading: false,
                isReady: true,
                characters: [
                    {
                        id: 'c2',
                        type: 'sampleChar1',
                        position: {
                            x: 0, y: 2
                        }
                    }
                ]
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
    };

    return {
        roomId: '',
        map: {
            mapList: [],
            mapSelected: null
        },
        teamsTree: entityTreeData,
        launchTime: Date.now() + 10_000
    };
};

export const Default: React.FC<StoryProps> = () => {

    return <>
        <Wrapper roomState={getShouldPutCharactersState()} />
        <Wrapper roomState={getTeamsEnoughState()} />
        <Wrapper roomState={getNotReadyState()} />
        <Wrapper roomState={getIsLoadingState()} />
        <Wrapper roomState={getWaitingOthersState()} />
        <Wrapper roomState={getLaunchState()} />
    </>;
};
