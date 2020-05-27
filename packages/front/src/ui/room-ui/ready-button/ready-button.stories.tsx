import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { GameState } from '../../../game-state';
import { EntityTreeData } from '../../reducers/room-reducers/entity-tree-reducer/entity-tree-reducer';
import { ReadyButton } from './ready-button';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { rootReducer } from '../../reducers/root-reducer';
import { RoomData } from '../../reducers/room-reducers/room-reducer';
import { Box } from '@material-ui/core';

export default {
    title: 'Room/Ready button',
    component: ReadyButton
};

const Wrapper: React.FC<{
    roomState: RoomData;
    fakeApi?: StoryProps[ 'fakeBattleApi' ];
}> = ({ roomState, fakeApi }) => {

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: 'chnapy',
        },
        step: 'room',
        battle: null,
        room: roomState
    };

    const ProviderComponent = fakeApi
        ? fakeApi.init({ initialState }).Provider
        : props => <Provider store={createStore(rootReducer, initialState)} {...props} />;

    return <Box display='inline-flex' flexDirection='column' mb={1} mr={1} width={400} flexShrink={0}>
        <ProviderComponent>
            <ReadyButton />
        </ProviderComponent>
    </Box>;
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
