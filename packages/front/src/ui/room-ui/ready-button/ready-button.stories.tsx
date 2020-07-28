import { createPosition } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { seedGameState } from '../../../game-state.seed';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
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

    const initialState = seedGameState('p1', {
        step: 'room',
        room: roomState
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
                        type: 'tacka',
                        position: createPosition(0, 2)
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
                        type: 'tacka',
                        position: createPosition(0, 1)
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
                        type: 'tacka',
                        position: createPosition(4, 8)
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
                        type: 'tacka',
                        position: createPosition(0, 2)
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

export const Default: React.FC = () => {

    return <>
        <Wrapper roomState={getShouldPutCharactersState()} />
        <Wrapper roomState={getTeamsEnoughState()} />
        <Wrapper roomState={getNotReadyState()} />
        <Wrapper roomState={getIsLoadingState()} />
        <Wrapper roomState={getWaitingOthersState()} />
        <Wrapper roomState={getLaunchState()} />
    </>;
};
