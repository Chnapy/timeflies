import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { GameState } from '../../../game-state';
import { EntityTreeData } from '../../reducers/room-reducers/entity-tree-reducer/entity-tree-reducer';
import { EntityTree } from './entity-tree';

export default {
    title: 'Room/Entity Tree',
    component: EntityTree
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

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
        battle: null,
        load: null,
        room: {
            map: {
                mapList: [],
                mapSelected: null
            },
            teamsTree: entityTreeData
        }
    };

    fakeBattleApi.init({ initialState });

    return <EntityTree />;
};
